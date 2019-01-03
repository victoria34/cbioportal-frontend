import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import { INctTrial, ITrial, ITrialMatch } from "../../../shared/model/MatchMiner";
import styles from './style/MatchMiner.module.scss';

export type IMatchMinerProps = {
    trials: Array<ITrial>;
    trialMatches:Array<ITrialMatch>;
    nctTrials:Array<INctTrial>;
}

@observer
export default class MatchMiner extends React.Component<IMatchMinerProps, {detailedTrialMatches: any}> {

    constructor(props: IMatchMinerProps){
        super();
        this.state = { detailedTrialMatches: this.buildDetaildTrialMatches(props.trialMatches, props.trials, props.nctTrials)};
    }

    shouldComponentUpdate(nextProps: IMatchMinerProps){
        return nextProps === this.props;
    }

    buildDetaildTrialMatches(matches: Array<ITrialMatch>, trials: Array<ITrial>, nctTrials: Array<INctTrial>) {

        let groupedMatches = _.groupBy(matches, 'nctId');
        let matchedTrials: Array<any> = [];
        const trialIds = Object.keys(groupedMatches);
        _.forEach(trialIds, function (key) {
            let matchedTrial:any = {};
            _.some(trials, function(trial) {
                if (key === trial['nctId']) {
                    matchedTrial = trial;
                    return true;
                }
            });
            matchedTrial['matches'] = groupedMatches[key];

            _.some(nctTrials, function(trial) {
                if (key === trial['nctId']) {
                    matchedTrial['diseases'] = trial['diseases'];
                    matchedTrial['interventions'] = trial['interventions'];
                    return true;
                }
            });

            matchedTrials.push(matchedTrial);
        });
        return matchedTrials;
    }

    render(){
        const reports = this.state.detailedTrialMatches.map(function(trial: any){
            return (
                <tr>
                    <td>
                        <div className="row">
                            <div className="col-md-5">
                                {trial.matches.map(function(match: any) {
                                    return (
                                        <If condition={match.trueHugoSymbol || match.trueProteinChange}>
                                            <span>{match.trueHugoSymbol + ' ' + match.trueProteinChange}</span>
                                            <br/>
                                        </If>
                                    )}
                                )}
                            </div>
                            <div className="col-md-1">
                                <i className="fa fa-arrow-right" aria-hidden="true"></i>
                            </div>
                            <div className="col-md-6">
                                {trial.matches.map(function(match: any) {
                                    return (
                                        <div>
                                            <If condition={match.genomicAlteration.includes('!')}>
                                                <Then>
                                                    <span><b>No </b>{match.genomicAlteration.replace(/!/g, '',)}</span>
                                                </Then>
                                                <Else>
                                                    <span>{match.genomicAlteration}</span>
                                                </Else>
                                            </If>
                                            <br/>
                                        </div>
                                    )}
                                )}
                            </div>
                        </div>
                    </td>
                    <td>
                        <span>{trial.status}</span>
                    </td>
                    <td>
                        <span><a href={"https://clinicaltrials.gov/ct2/show/" + trial.nctId}>{trial.nctId}</a></span>
                    </td>
                    <td>
                        <span>{trial.shortTitle}</span>
                    </td>
                    <td>
                        <ul>
                            {trial.diseases.map(function(disease: any) {
                                return (
                                    <li>{disease}</li>
                                )}
                            )}
                        </ul>
                    </td>
                    <td>
                        <ul>
                            {trial.interventions.map(function(intervention: any) {
                                return (
                                    <li>{intervention}</li>
                                )}
                            )}
                        </ul>
                    </td>
                </tr>
            )});
        return (
            <div className={styles.container}>
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Genomic Match</th>
                        <th>Status</th>
                        <th>NCT ID</th>
                        <th className={styles.thTitle}>Title</th>
                        <th>Disease</th>
                        <th>Interventions</th>
                    </tr>
                    </thead>
                    <tbody>
                        {reports}
                    </tbody>
                </table>
            </div>
        );
    }
}

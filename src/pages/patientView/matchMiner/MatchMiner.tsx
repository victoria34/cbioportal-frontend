import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import { ITrial, ITrialMatch } from "../../../shared/model/MatchMiner";
import styles from './style/MatchMiner.module.scss';

export type IMatchMinerProps = {
    trialMatches:Array<ITrialMatch>;
    trials:Array<ITrial>;
}

@observer
export default class MatchMiner extends React.Component<IMatchMinerProps, {detailedTrialMatches: any}> {

    constructor(props: IMatchMinerProps){
        super();
        this.state = { detailedTrialMatches: this.buildDetaildTrialMatches(props.trialMatches, props.trials)};
    }

    shouldComponentUpdate(nextProps: IMatchMinerProps){
        return nextProps === this.props;
    }

    buildDetaildTrialMatches(matches: Array<ITrialMatch>, trials: Array<ITrial>) {

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
            matchedTrials.push(matchedTrial);
        });
        return matchedTrials;
    }

    render(){
        const reports = this.state.detailedTrialMatches.map(function(trial: any){
            return (
                <tr>
                    <td>
                        {trial.matches.map(function(match: any) {
                            return (
                                <div className="row">
                                    <div className={"col-md-6 " + styles.genomicCol}>
                                        <span className={styles.genomicSpan}>{match.genomicAlteration}</span>
                                    </div>
                                </div>
                            )}
                        )}
                    </td>
                    <td>
                        {trial.matches.map(function(match: any) {
                                return (
                                    <div className="row">
                                        <div className={"col-md-6 " + styles.genomicCol}>
                                            <If condition={match.trueHugoSymbol && match.trueProteinChange}>
                                                <span className={styles.genomicSpan}>{match.trueHugoSymbol}  {match.trueProteinChange}</span>
                                            </If>
                                        </div>
                                    </div>
                            )}
                        )}
                    </td>
                    <td>
                        <div className="row">
                            <div className="col-md-12">
                                <span className={styles.boldSpan}>{trial.shortTitle}</span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <span className={styles.boldSpan}>NCT ID:</span>
                                <span>{trial.nctId}</span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <span className={styles.boldSpan}>Status:</span>
                                <span>{trial.status}</span>
                            </div>
                        </div>
                    </td>
                </tr>
            )});
        return (
            <div className={styles.container}>
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Trial Genomic</th>
                        <th>Patient Genomic</th>
                        <th>Trial Info</th>
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

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
        let matchedTrials = [];
        if (Array.isArray(groupedMatches)) {
            console.log("is Array");
        } else {
            const key = Object.keys(groupedMatches)[0];
            let matchedTrial:any = {};
            _.some(trials, function(trial) {
                if (key === trial['nctId']) {
                    matchedTrial = trial;
                    return true;
                }
            });
            matchedTrial['matches'] = groupedMatches[key];
            matchedTrials.push(matchedTrial);

        }
        return matchedTrials;
    }

    render(){
        const reports = this.state.detailedTrialMatches.map(function(trial: any){
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
                            <tr>
                                <td>
                                    {trial.matches.map(function(match: any) {
                                        return (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <span className={styles.genomicspan}>{match.genomicAlteration}</span>
                                                </div>
                                            </div>
                                        )}
                                    )}
                                </td>
                                <td>
                                    {trial.matches.map(function(match: any) {
                                            return (
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <If condition={match.trueHugoSymbol && match.trueProteinChange}>
                                                            <span className={styles.genomicspan}>{match.trueHugoSymbol}  {match.trueProteinChange}</span>
                                                        </If>
                                                    </div>
                                                </div>
                                        )}
                                    )}
                                </td>
                                <td>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <span className={styles.boldspan}>{trial.shortTitle}</span>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <span className={styles.boldspan}>NCT ID:</span>
                                            <span>{trial.nctId}</span>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <span className={styles.boldspan}>Status:</span>
                                            <span>{trial.status}</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )});
        return (
            <div>
                {reports}
            </div>
        );
    }
}

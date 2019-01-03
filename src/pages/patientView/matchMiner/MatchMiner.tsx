import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import { IEligibility, INctTrial, ITrial, ITrialMatch } from "../../../shared/model/MatchMiner";
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
        this.state = { detailedTrialMatches: this.buildDetailedTrialMatches(props.trialMatches, props.trials, props.nctTrials)};
    }

    shouldComponentUpdate(nextProps: IMatchMinerProps){
        return nextProps === this.props;
    }

    buildDetailedTrialMatches(matches: Array<ITrialMatch>, trials: Array<ITrial>, nctTrials: Array<INctTrial>) {
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
                    let eligibility: IEligibility = {
                        clinical:{
                            age: '',
                            sex: ''
                        },
                        genomic: {
                            inclusion: [],
                            exclusion: []
                        }
                    };
                    const structuredEligibility = trial['eligibility']['structured'];
                    const unstructuredEligibility = trial['eligibility']['unstructured'];
                    if (structuredEligibility['max_age_number'] > 99) {
                        eligibility.clinical.age = structuredEligibility['min_age'] + ' and older'
                    } else {
                        eligibility.clinical.age = structuredEligibility['min_age'] + ' ~ ' + structuredEligibility['max_age']
                    }
                    if (structuredEligibility['gender'] === 'BOTH') {
                        eligibility.clinical.sex = 'All';
                    } else {
                        eligibility.clinical.sex = structuredEligibility['gender'];
                    }
                    _.forEach(unstructuredEligibility, function(ele) {
                        if (ele['inclusion_indicator']) {
                            eligibility.genomic.inclusion.push(ele);
                        } else {
                            eligibility.genomic.exclusion.push(ele);
                        }
                    });
                    matchedTrial['eligibility'] = eligibility;
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
                        <span><a href={"https://clinicaltrials.gov/ct2/show/" + trial.nctId}>{trial.nctId}</a></span>
                    </td>
                    <td>
                        <span>{trial.shortTitle}</span>
                    </td>
                    <td>
                        <ul className={styles.diseasesUl}>
                            {trial.diseases.map(function(disease: any) {
                                return (
                                    <li>{disease}</li>
                                )}
                            )}
                        </ul>
                    </td>
                    <td>
                        <ul className={styles.diseasesUl}>
                            {trial.interventions.map(function(intervention: any) {
                                return (
                                    <li>{intervention}</li>
                                )}
                            )}
                        </ul>
                    </td>
                    <td>
                        <div>
                            <span>Age:&nbsp;</span><span>{trial.eligibility.clinical.age}</span>
                            <br/>
                            <span>Sex:&nbsp;</span><span>{trial.eligibility.clinical.sex}</span>
                            <br/>
                            <div>
                                <If condition={trial.eligibility.genomic.inclusion.length > 0}>
                                    <button className={"btn btn-xs " + styles.criteriaButton + " " + styles.orangeButton}>
                                        {trial.eligibility.genomic.inclusion.length} inclusion criteria
                                    </button>
                                </If>
                                <If condition={trial.eligibility.genomic.exclusion.length > 0}>
                                    <button className={"btn btn-xs " + styles.criteriaButton + " " + styles.greenButton}>
                                        {trial.eligibility.genomic.exclusion.length} exclusion criteria
                                    </button>
                                </If>
                            </div>
                        </div>
                    </td>
                    <td>
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
                        <span className={styles.fontItalic}>(Matched to patient with&nbsp;
                            {trial.matches.map(function(match: any) {
                                return (
                                    <If condition={match.trueHugoSymbol || match.trueProteinChange}>
                                        <span>{match.trueHugoSymbol + ' ' + match.trueProteinChange}</span>
                                        <br/>
                                    </If>
                                )}
                            )})
                        </span>
                    </td>
                    <td>
                        <span>{trial.status}</span>
                    </td>
                </tr>
            )});
        return (
            <div className={styles.container}>
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>NCT ID</th>
                        <th className={styles.thTitle}>Title</th>
                        <th>Diseases</th>
                        <th>Interventions</th>
                        <th>Criteria</th>
                        <th>Genomic Match</th>
                        <th>Status</th>
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

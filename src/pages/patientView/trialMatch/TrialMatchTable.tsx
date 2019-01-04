import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import { IDiscreteTrialMatch, IEligibility, INctTrial, ITrial, ITrialMatch } from "../../../shared/model/MatchMiner";
import styles from './style/trialMatch.module.scss';
import { computed } from "mobx";
import LazyMobXTable from "../../../shared/components/lazyMobXTable/LazyMobXTable";
import ClickedButton from "./clickedButton";

export type ITrialMatchProps = {
    trials: Array<ITrial>;
    trialMatches:Array<ITrialMatch>;
    nctTrials:Array<INctTrial>;
    containerWidth: number;
}

export type ITrialMatchState = {
    detailedTrialMatches: Array<IDiscreteTrialMatch>;
}

class TrialMatchTableComponent extends LazyMobXTable<IDiscreteTrialMatch> {

}

enum ColumnKey {
    NCTID = 'NCT ID',
    TITLE = 'Title',
    DISEASES = 'Diseases',
    INTERVENTIONS = 'Interventions',
    CRITERIA = 'Criteria',
    GENOMICMATCH = 'Genomic Match',
    STATUS = 'Status'
}

@observer
export default class TrialMatchTable extends React.Component<ITrialMatchProps, ITrialMatchState> {

    constructor(props: ITrialMatchProps) {
        super(props);

        this.state = { detailedTrialMatches: this.buildDetailedTrialMatches(props.trialMatches, props.trials, props.nctTrials)};
    }

    @computed
    get columnsWidth() {
        return {
            [ColumnKey.NCTID]: 100,
            [ColumnKey.TITLE]: this.props.containerWidth! - 1500,
            [ColumnKey.DISEASES]: 350,
            [ColumnKey.INTERVENTIONS]: 350,
            [ColumnKey.CRITERIA]: 300,
            [ColumnKey.GENOMICMATCH]: 300,
            [ColumnKey.STATUS]: 100
        };
    }

    private _columns = [{
        name: ColumnKey.NCTID,
        render: (trial: IDiscreteTrialMatch) => {
            return (
                <span><a href={"https://clinicaltrials.gov/ct2/show/" + trial.nctId}>{trial.nctId}</a></span>
            )
        },
        width: this.columnsWidth[ColumnKey.NCTID]
    }, {
        name: ColumnKey.TITLE,
        render: (trial: IDiscreteTrialMatch) => {
            return (
                <span>{trial.shortTitle}</span>
            )
        },
        // width: this.columnsWidth[ColumnKey.TITLE]
    }, {
        name: ColumnKey.DISEASES,
        render: (trial: IDiscreteTrialMatch) => {
            return (
                <ul className={styles.diseasesUl}>
                    {trial.diseases.map(function(disease: any) {
                        return (
                            <li>{disease}</li>
                        )}
                    )}
                </ul>
            )
        },
        width: this.columnsWidth[ColumnKey.DISEASES]
    }, {
        name: ColumnKey.INTERVENTIONS,
        render: (trial: IDiscreteTrialMatch) => {
            return (
                <ul className={styles.diseasesUl}>
                    {trial.interventions.map(function(intervention: any) {
                        return (
                            <li>{intervention}</li>
                        )}
                    )}
                </ul>
            )
        },
        width: this.columnsWidth[ColumnKey.INTERVENTIONS]
    }, {
        name: ColumnKey.CRITERIA,
        render: (trial: IDiscreteTrialMatch) => {
            return (
                <div>
                    <span>Age:&nbsp;</span><span>{trial.eligibility.clinical.age}</span>
                    <br/>
                    <span>Sex:&nbsp;</span><span>{trial.eligibility.clinical.sex}</span>
                    <br/>
                    <div>
                        <If condition={trial.eligibility.genomic.inclusion.length > 0}>
                            <ClickedButton
                                buttonName={trial.eligibility.genomic.inclusion.length + ' inclusion criteria'}
                                className={"btn btn-xs " + styles.criteriaButton + " " + styles.orangeButton}
                                listName="Inclusion Criteria"
                                listContent={trial.eligibility.genomic.inclusion}
                            >
                            </ClickedButton>
                        </If>
                        <If condition={trial.eligibility.genomic.exclusion.length > 0}>
                            <ClickedButton
                                buttonName={trial.eligibility.genomic.exclusion.length + ' exclusion criteria'}
                                className={"btn btn-xs " + styles.criteriaButton + " " + styles.greenButton}
                                listName="Exclusion Criteria"
                                listContent={trial.eligibility.genomic.exclusion}
                            >
                            </ClickedButton>
                        </If>
                    </div>
                </div>
            )
        },
        // width: this.columnsWidth[ColumnKey.CRITERIA]
    }, {
        name: ColumnKey.GENOMICMATCH,
        render: (trial: IDiscreteTrialMatch) => {
            return (
                <div>
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
                </div>
            )
        },
        width: this.columnsWidth[ColumnKey.GENOMICMATCH]
    }, {
        name: ColumnKey.STATUS,
        render: (trial: IDiscreteTrialMatch) => {
            return (
                <span>{trial.status}</span>
            )
        },
        width: this.columnsWidth[ColumnKey.STATUS]
    }];

    buildDetailedTrialMatches(matches: Array<ITrialMatch>, trials: Array<ITrial>, nctTrials: Array<INctTrial>) {
        let groupedMatches = _.groupBy(matches, 'nctId');
        let matchedTrials: Array<IDiscreteTrialMatch> = [];
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

    render() {
        return (
            <TrialMatchTableComponent
                data={this.state.detailedTrialMatches}
                columns={this._columns}
            />
        )
    }
}

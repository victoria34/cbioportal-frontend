import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import { IDiscreteTrialMatch, INctTrial, ITrial, ITrialMatch } from "../../../shared/model/MatchMiner";
import styles from './style/trialMatch.module.scss';
import { computed } from "mobx";
import LazyMobXTable from "../../../shared/components/lazyMobXTable/LazyMobXTable";

export type ITrialMatchProps = {
    trials: Array<ITrial>;
    trialMatches:Array<ITrialMatch>;
    nctTrials:Array<INctTrial>;
    containerWidth: number;
}

export type ITrialMatchState = {
    detailedTrialMatches: Array<IDiscreteTrialMatch>;
}

enum ColumnKey {
    PROTOCOLNO = 'Protocol No',
    NCTID = 'NCT ID',
    TITLE = 'Title',
    DISEASES = 'Diseases',
    INTERVENTIONS = 'Interventions',
    CLINICALCRITERIA = 'Clinical Criteria',
    GENOMICCRITERIA = 'Genomic Criteria',
    STATUS = 'Status'
}

function findClinicalNode(match: any, result: any) {
    //Find all clinical nodes under 'match' object
    if (match['clinical']) {
        if (match['clinical']['oncotree_primary_diagnosis']) {
            result.diseases.push(match['clinical']['oncotree_primary_diagnosis']);
        }
        if (match['clinical']['age_numerical']) {
            result.age.push(match['clinical']['age_numerical']);
        }
        if (match['clinical']['gender']) {
            result.gender.push(match['clinical']['gender']);
        }
    } else if (match['and']) {
        _.forEach(match['and'], function(andNode) {
            findClinicalNode(andNode, result);
        });
    } else if (match['or']) {
        _.forEach(match['or'], function(orNode) {
            findClinicalNode(orNode, result);
        });
    }
}

class TrialMatchTableComponent extends LazyMobXTable<IDiscreteTrialMatch> {

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
            [ColumnKey.PROTOCOLNO]: 100,
            [ColumnKey.NCTID]: 100,
            [ColumnKey.TITLE]: 300,
            [ColumnKey.DISEASES]: 160,
            [ColumnKey.INTERVENTIONS]: this.props.containerWidth - 1000,
            [ColumnKey.CLINICALCRITERIA]: 130,
            [ColumnKey.GENOMICCRITERIA]: 150,
            [ColumnKey.STATUS]: 60
        };
    }

    private _columns = [{
        name: ColumnKey.PROTOCOLNO,
        render: (trial: IDiscreteTrialMatch) => {
            return (
                <span><a target="_blank" href={"https://www.mskcc.org/cancer-care/clinical-trials/" + trial.protocolNo}>{trial.protocolNo}</a></span>
            )
        },
        width: this.columnsWidth[ColumnKey.PROTOCOLNO]
    }, {
        name: ColumnKey.NCTID,
        render: (trial: IDiscreteTrialMatch) => {
            return (
                <span><a target="_blank" href={"https://clinicaltrials.gov/ct2/show/" + trial.nctId}>{trial.nctId}</a></span>
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
        width: this.columnsWidth[ColumnKey.TITLE]
    }, {
        name: ColumnKey.STATUS,
        render: (trial: IDiscreteTrialMatch) => {
            return (
                <span>{trial.status}</span>
            )
        },
        width: this.columnsWidth[ColumnKey.STATUS]
    }, {
        name: ColumnKey.GENOMICCRITERIA,
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
        width: this.columnsWidth[ColumnKey.GENOMICCRITERIA]
    }, {
        name: ColumnKey.CLINICALCRITERIA,
        render: (trial: IDiscreteTrialMatch) => {
            return (
                <div>
                    <If condition={trial.age}>
                        <Then>
                            <span>Age:&nbsp;</span><span>{trial.age}</span>
                            <br/>
                        </Then>
                    </If>
                    <If condition={trial.gender}>
                        <Then>
                            <span>Gender:&nbsp;</span><span>{trial.gender}</span>
                            <br/>
                        </Then>
                    </If>
                </div>
            )
        },
        width: this.columnsWidth[ColumnKey.CLINICALCRITERIA]
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

            let clinicalInfo: any = {
                diseases: [],
                age: [],
                gender: []
            };
            // Get all diseases(oncotree_primary_diagnoses)
            _.forEach(matchedTrial['treatmentList']['step'], function(step){
                if (step['arm']) {
                    _.forEach(step['arm'], function(arm) {
                        if (arm['match']) {
                            _.forEach(arm['match'], function(match) {
                                findClinicalNode(match, clinicalInfo);
                            });
                        }
                    });
                }
                if (step['match']) {
                    _.forEach(step['match'], function(match) {
                        findClinicalNode(match, clinicalInfo);
                    });
                }
            });
            matchedTrial['diseases'] = _.uniq(clinicalInfo.diseases);
            matchedTrial['age'] = _.uniq(clinicalInfo.age).join(', ');
            matchedTrial['gender'] = _.uniq(clinicalInfo.gender).join(', ');

            _.some(nctTrials, function(trial) {
                if (key === trial['nctId']) {
                    matchedTrial['interventions'] = trial['interventions'];
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

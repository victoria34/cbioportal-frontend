import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import {
    IClinicalGroupMatch, IGenomicGroupMatch, IDiscreteTrialMatch, IGenomicMatch, INctTrial, ITrial,
    ITrialMatch
} from "../../../shared/model/MatchMiner";
import styles from './style/trialMatch.module.scss';
import { computed } from "mobx";
import LazyMobXTable from "../../../shared/components/lazyMobXTable/LazyMobXTable";
import SampleManager from "../sampleManager";

export type ITrialMatchProps = {
    sampleManager?: SampleManager | null;
    trials: Array<ITrial>;
    trialMatches:Array<ITrialMatch>;
    nctTrials:Array<INctTrial>;
    containerWidth: number;
}

export type ITrialMatchState = {
    detailedTrialMatches: Array<IDiscreteTrialMatch>;
}

enum ColumnKey {
    ID = 'ID',
    TITLE = 'Title',
    INTERVENTIONS = 'Interventions',
    MATCHINGCRITERIA = 'Matching Criteria'
}

class TrialMatchTableComponent extends LazyMobXTable<IDiscreteTrialMatch> {

}

@observer
export default class TrialMatchTable extends React.Component<ITrialMatchProps, ITrialMatchState> {

    constructor(props: ITrialMatchProps) {
        super(props);
        if (props.sampleManager) {
            this.state = { detailedTrialMatches: this.buildDetailedTrialMatches(props.trialMatches, props.trials, props.nctTrials, props.sampleManager) };
        } else {
            this.state = { detailedTrialMatches: this.buildDetailedTrialMatches(props.trialMatches, props.trials, props.nctTrials) };
        }
    }

    @computed
    get columnsWidth() {
        return {
            [ColumnKey.ID]: 0.1 * this.props.containerWidth,
            [ColumnKey.TITLE]: 0.24 * this.props.containerWidth,
            [ColumnKey.INTERVENTIONS]: 0.16 * this.props.containerWidth,
            [ColumnKey.MATCHINGCRITERIA]: 0.5 * this.props.containerWidth
        };
    }

    private _columns = [{
        name: ColumnKey.ID,
        render: (trial: IDiscreteTrialMatch) => (
            <div>
                <span><a target="_blank" href={"https://www.mskcc.org/cancer-care/clinical-trials/" + trial.protocolNo}>{trial.protocolNo}</a></span><br/>
                <span><a target="_blank" href={"https://clinicaltrials.gov/ct2/show/" + trial.nctId}>{trial.nctId}</a></span><br/>
                <span>{trial.status}</span>
            </div>
        ),
        width: this.columnsWidth[ColumnKey.ID]
    }, {
        name: ColumnKey.TITLE,
        render: (trial: IDiscreteTrialMatch) => (
                <span>{trial.shortTitle}</span>
        ),
        width: this.columnsWidth[ColumnKey.TITLE]
    }, {
        name: ColumnKey.MATCHINGCRITERIA,
        render: (trial: IDiscreteTrialMatch) => {
            const props = this.props;
            return <div> {
                trial.matches.map((clinicalGroupMatch: any) => (
                <div className={styles.criteriaContainer}>
                    <span className={styles.genomicSpan + styles.firstLeft}>
                        {clinicalGroupMatch.matches.map((genomicGroupMatch: any) => (
                            <If condition={genomicGroupMatch.genomicAlteration.includes('!')}>
                                <Then>
                                    <div>
                                        <span className={styles.genomicSpan + styles.firstLeft}><b>Not </b>{genomicGroupMatch.genomicAlteration.replace(/!/g, '',) + ' '}
                                            {genomicGroupMatch.matches[0].sampleIds.map((sampleId: string) => (
                                                <span className={styles.genomicSpan}>
                                                    {props.sampleManager!.getComponentForSample(sampleId, 1, '')}
                                                </span>
                                            ))}
                                        </span>
                                    </div>
                                </Then>
                                <Else>
                                    <div>
                                        <span className={styles.genomicSpan + styles.firstLeft}>
                                            {genomicGroupMatch.genomicAlteration + ' ( '}
                                            {genomicGroupMatch.matches.map((genomicMatch: any) => (
                                                <span>{genomicMatch.trueHugoSymbol + ' ' + genomicMatch.trueProteinChange + ' '}
                                                {genomicMatch.sampleIds.map((sampleId: string) => (
                                                    <span className={styles.genomicSpan}>
                                                    {props.sampleManager!.getComponentForSample(sampleId, 1, '')}
                                                    </span>
                                                ))}
                                                </span>
                                            ))}
                                            {')'}
                                        </span>
                                    </div>
                                </Else>
                            </If>
                        ))}
                    </span>
                    <span className={styles.firstRight}>
                         <span className={styles.secondLeft}>{clinicalGroupMatch.trialAgeNumerical}</span>
                        <span className={styles.secondRight}>{clinicalGroupMatch.trialOncotreePrimaryDiagnosis}</span>
                    </span>
                </div>
            ))
            }</div>
        },
        width: this.columnsWidth[ColumnKey.MATCHINGCRITERIA]
    }, {
        name: ColumnKey.INTERVENTIONS,
        render: (trial: IDiscreteTrialMatch) => (
                <ul className={styles.diseasesUl}>
                    {trial.interventions.map((intervention: any) => (
                        <li>{intervention}</li>
                    ))}
                </ul>
        ),
        width: this.columnsWidth[ColumnKey.INTERVENTIONS]
    }];

    buildDetailedTrialMatches(matches: Array<ITrialMatch>, trials: Array<ITrial>, nctTrials: Array<INctTrial>, sampleManager?: SampleManager) {
        const groupedMatches = _.groupBy(matches, 'nctId');
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

            const groupBypatientClinical = _.groupBy(groupedMatches[key], 'patientClinical');
            const ciKeys = Object.keys(groupBypatientClinical).sort();
            let matches: Array<IClinicalGroupMatch> = [];
            _.forEach(ciKeys, function(ciKey) {
                let clinicalGroupMatch: IClinicalGroupMatch = {
                    trialAgeNumerical: groupBypatientClinical[ciKey][0].trialAgeNumerical,
                    trialOncotreePrimaryDiagnosis: groupBypatientClinical[ciKey][0].trialOncotreePrimaryDiagnosis,
                    matches: []
                };
                const groupByGenomicAlteration = _.groupBy(groupBypatientClinical[ciKey], 'genomicAlteration');
                const gaKeys = Object.keys(groupByGenomicAlteration).sort((a,b) => {
                    if (a.includes('!')) {
                        if (b.includes('!')) { // a and b contain '!'
                            return a.length - b.length || a.slice(1).localeCompare(b.slice(1));
                        } else { // only a contains '!'
                            return 1;
                        }
                    } else {
                        if (b.includes('!')) { // only b contains '!'
                            return -1;
                        } else { // a and b don't contain '!'
                            return a.length - b.length || a.localeCompare(b);
                        }
                    }
                });

                _.forEach(gaKeys, function(gaKey) {
                    const groupByPatientGenomic = _.groupBy(groupByGenomicAlteration[gaKey], 'patientGenomic');
                    const pgKeys = Object.keys(groupByPatientGenomic);
                    let genomicGroupMatch: IGenomicGroupMatch = {
                        genomicAlteration: gaKey,
                        matches: []
                    };
                    _.forEach(pgKeys, function(pgKey) {
                        let genomicMatch: IGenomicMatch = {
                            trueHugoSymbol: groupByPatientGenomic[pgKey][0].trueHugoSymbol,
                            trueProteinChange: groupByPatientGenomic[pgKey][0].trueProteinChange,
                            sampleIds: []
                        };
                        const sampleIds = _.uniq(_.map(groupByPatientGenomic[pgKey], 'sampleId'));
                        if (sampleIds.length > 1 && sampleManager) {
                            sampleManager.samples.map((item:any) => {
                                if (sampleIds.includes(item.id)) {
                                    genomicMatch.sampleIds.push(item.id);
                                }
                            });
                        } else {
                            genomicMatch.sampleIds = sampleIds;
                        }
                        genomicGroupMatch.matches.push(genomicMatch);
                    });

                    clinicalGroupMatch.matches.push(genomicGroupMatch);
                });

                matches.push(clinicalGroupMatch);
            });

            matchedTrial['matches'] = matches;

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
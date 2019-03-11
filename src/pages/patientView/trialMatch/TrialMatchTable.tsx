import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import {
    IClinicalGroupMatch, IGenomicGroupMatch, IGenomicMatch, INctTrial, ITrial,
    ITrialMatch, IDetailedTrialMatch, IArmMatch
} from "../../../shared/model/MatchMiner";
import styles from './style/trialMatch.module.scss';
import { computed } from "mobx";
import LazyMobXTable from "../../../shared/components/lazyMobXTable/LazyMobXTable";
import SampleManager from "../sampleManager";
import DefaultTooltip, { placeArrowBottomLeft } from "../../../shared/components/defaultTooltip/DefaultTooltip";

export type ITrialMatchProps = {
    sampleManager?: SampleManager | null;
    trials: Array<ITrial>;
    trialMatches:Array<ITrialMatch>;
    nctTrials:Array<INctTrial>;
    containerWidth: number;
}

export type ITrialMatchState = {
    detailedTrialMatches: Array<IDetailedTrialMatch>;
}

enum ColumnKey {
    ID = 'ID',
    TITLE = 'Title',
    INTERVENTIONS = 'Interventions',
    MATCHINGCRITERIA = 'Matching Criteria'
}

class TrialMatchTableComponent extends LazyMobXTable<IDetailedTrialMatch> {

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
        render: (trial: IDetailedTrialMatch) => (
            <div>
                <span><a target="_blank" href={"https://www.mskcc.org/cancer-care/clinical-trials/" + trial.protocolNo}>{trial.protocolNo}</a></span><br/>
                <span><a target="_blank" href={"https://clinicaltrials.gov/ct2/show/" + trial.nctId}>{trial.nctId}</a></span><br/>
                <span>{trial.status}</span>
            </div>
        ),
        sortBy:(trial: IDetailedTrialMatch) => (trial.protocolNo),
        download: (trial: IDetailedTrialMatch) => (trial.protocolNo + ', ' + trial.nctId + ', ' + trial.status),
        width: this.columnsWidth[ColumnKey.ID]
    }, {
        name: ColumnKey.TITLE,
        render: (trial: IDetailedTrialMatch) => (
                <span>{trial.shortTitle}</span>
        ),
        sortBy:(trial: IDetailedTrialMatch) => (trial.shortTitle),
        download:(trial: IDetailedTrialMatch) => (trial.shortTitle),
        width: this.columnsWidth[ColumnKey.TITLE]
    }, {
        name: ColumnKey.MATCHINGCRITERIA,
        render: (trial: IDetailedTrialMatch) => {
            const props = this.props;
            return <div>
                {trial.matches.map((armMatch: any, index: number) => (
                    <div>
                        <div>
                            <If condition={armMatch.armDescription !== 'null'}>
                                <span><b>{'Arm: ' + armMatch.armDescription}</b></span>
                            </If>
                            <div>
                                {armMatch.matches.map((clinicalGroupMatch: any, cgIndex:number) => (
                                    <div>
                                        <span className={styles.criteriaContainer}>
                                            <span className={styles.firstLeft}>
                                                {clinicalGroupMatch.matches.map((genomicGroupMatch: any) => (
                                                    <If condition={genomicGroupMatch.matches.length === 1 &&
                                                    genomicGroupMatch.genomicAlteration === genomicGroupMatch.matches[0].trueHugoSymbol + ' ' + genomicGroupMatch.matches[0].trueProteinChange}>
                                                        <Then>
                                                            <div>
                                                                <span>{genomicGroupMatch.genomicAlteration + ' '}
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
                                                                    {genomicGroupMatch.genomicAlteration + ': '}
                                                                    <If condition={genomicGroupMatch.matches.length > 1}>
                                                                        <Then>
                                                                            <ul className={styles.alterationUl}>
                                                                            {genomicGroupMatch.matches.map((genomicMatch: any) => (
                                                                                <li>{genomicMatch.trueHugoSymbol + ' ' + genomicMatch.trueProteinChange + ' '}
                                                                                    {genomicMatch.sampleIds.map((sampleId: string) => (
                                                                                        <span className={styles.genomicSpan}>
                                                                                            {props.sampleManager!.getComponentForSample(sampleId, 1, '')}
                                                                                        </span>
                                                                                    ))}
                                                                                </li>
                                                                            ))}
                                                                            </ul>
                                                                        </Then>
                                                                        <Else>
                                                                            <span>{genomicGroupMatch.matches[0].trueHugoSymbol + ' ' + genomicGroupMatch.matches[0].trueProteinChange + ' '}
                                                                                {genomicGroupMatch.matches[0].sampleIds.map((sampleId: string) => (
                                                                                    <span className={styles.genomicSpan}>
                                                                                        {props.sampleManager!.getComponentForSample(sampleId, 1, '')}
                                                                                    </span>
                                                                                ))}
                                                                            </span>
                                                                        </Else>
                                                                    </If>
                                                                </span>
                                                            </div>
                                                        </Else>
                                                    </If>
                                                ))}
                                                <If condition={clinicalGroupMatch.notMatches.length > 0}>
                                                    <DefaultTooltip
                                                        placement='bottomLeft'
                                                        trigger={['hover', 'focus']}
                                                        overlay={this.tooltipContent(clinicalGroupMatch.notMatches)}
                                                        arrowContent={<div className="rc-tooltip-arrow-inner" />}
                                                        destroyTooltipOnHide={false}
                                                        onPopupAlign={placeArrowBottomLeft}
                                                    >
                                                        {this.mainContent('No alterations in ' + this.getHugoSymbolName(clinicalGroupMatch.notMatches, 3) + ' genes defined by the trial')}
                                                    </DefaultTooltip>
                                                </If>
                                            </span>
                                            <span className={styles.firstRight}>
                                                <span className={styles.secondLeft}>{clinicalGroupMatch.trialAgeNumerical + ' yrs old'}</span>
                                                <If condition={clinicalGroupMatch.trialOncotreePrimaryDiagnosis.includes('!')}>
                                                    <Then>
                                                        <span className={styles.secondRight}><b>Not </b>{clinicalGroupMatch.trialOncotreePrimaryDiagnosis.replace(/!/g, '') }</span>
                                                    </Then>
                                                    <Else>
                                                        <span className={styles.secondRight}>{clinicalGroupMatch.trialOncotreePrimaryDiagnosis}</span>
                                                    </Else>
                                                </If>
                                            </span>
                                        </span>
                                        <If condition={cgIndex < armMatch.matches.length - 1}><hr className={styles.criteriaHr}/></If>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <If condition={index < trial.matches.length - 1}><hr className={styles.criteriaHr}/></If>
                    </div>
                ))}
                </div>
        },
        width: this.columnsWidth[ColumnKey.MATCHINGCRITERIA]
    }, {
        name: ColumnKey.INTERVENTIONS,
        render: (trial: IDetailedTrialMatch) => (
                <ul className={styles.diseasesUl}>
                    {trial.interventions.map((intervention: any) => (
                        <li>{intervention}</li>
                    ))}
                </ul>
        ),
        sortBy:(trial: IDetailedTrialMatch) => (trial.interventions[0]),
        download: (trial: IDetailedTrialMatch) => (trial.interventions.join(', ')),
        width: this.columnsWidth[ColumnKey.INTERVENTIONS]
    }];

    public tooltipContent(data: Array<IGenomicGroupMatch>) {
        const props = this.props;
        return (
            <div style={{ maxHeight:400, maxWidth:600, overflow:'auto' }}>
                {data.map((genomicGroupMatch: any) => (
                    <div className={styles.genomicSpan}><b>Not </b>{genomicGroupMatch.genomicAlteration.replace(/!/g, '',) + ' '}
                        {genomicGroupMatch.matches[0].sampleIds.map((sampleId: string) => (
                            <span className={styles.genomicSpan}>
                                {props.sampleManager!.getComponentForSample(sampleId, 1, '')}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    public mainContent(content: string) {
        return (
            <span>
                <a>{content}</a>
            </span>
        );
    }

    public getHugoSymbolName(matches: Array<IGenomicGroupMatch>, threshold: number) {
        const hugoSymbolSet = new Set([...matches].map(x => x.genomicAlteration.split(' ')[0].slice(1)));
        if (hugoSymbolSet.size <= threshold) {
            return [...hugoSymbolSet].join(', ');
        }
        return hugoSymbolSet.size;
    }

    public buildDetailedTrialMatches(matches: Array<ITrialMatch>, trials: Array<ITrial>, nctTrials: Array<INctTrial>, sampleManager?: SampleManager) {
        const groupedMatches = _.groupBy(matches, 'nctId');
        let matchedTrials: Array<IDetailedTrialMatch> = [];
        const trialIds = Object.keys(groupedMatches);
        _.forEach(trialIds, function (key) {
            let matchedTrial:any = {};
            _.some(trials, function(trial) {
                if (key === trial['nctId']) {
                    matchedTrial = trial;
                    return true;
                }
            });
            _.some(nctTrials, function(trial) {
                if (key === trial['nctId']) {
                    matchedTrial['interventions'] = trial['interventions'];
                    return true;
                }
            });

            matchedTrial['matches'] = [];
            const groupByArm = _.groupBy(groupedMatches[key], 'armDescription');
            const aKeys = Object.keys(groupByArm).sort();
            _.forEach(aKeys, function(aKey) {
                let armMatch: IArmMatch = {
                    armDescription: aKey,
                    matches: []
                };
                const groupBypatientClinical = _.groupBy(groupByArm[aKey], 'patientClinical');
                const ciKeys = Object.keys(groupBypatientClinical);
                _.forEach(ciKeys, function(ciKey) {
                    let clinicalGroupMatch: IClinicalGroupMatch = {
                        trialAgeNumerical: groupBypatientClinical[ciKey][0].trialAgeNumerical,
                        trialOncotreePrimaryDiagnosis: groupBypatientClinical[ciKey][0].trialOncotreePrimaryDiagnosis,
                        matches: [],
                        notMatches: []
                    };
                    const groupByGenomicAlteration = _.groupBy(groupBypatientClinical[ciKey], 'genomicAlteration');
                    const gaKeys = Object.keys(groupByGenomicAlteration).sort();
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
                        if(gaKey.includes('!')) {
                            clinicalGroupMatch.notMatches.push(genomicGroupMatch);
                        } else {
                            clinicalGroupMatch.matches.push(genomicGroupMatch);
                        }
                    });

                    armMatch.matches.push(clinicalGroupMatch);
                });
                matchedTrial['matches'].push(armMatch);
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

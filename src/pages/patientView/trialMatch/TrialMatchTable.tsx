import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import {
    IClinicalGroupMatch, IGenomicGroupMatch, IDetailedTrialMatch, IGenomicMatch, INctTrial, ITrial,
    ITrialMatch
} from "../../../shared/model/MatchMiner";
import styles from './style/trialMatch.module.scss';
import { computed } from "mobx";
import LazyMobXTable from "../../../shared/components/lazyMobXTable/LazyMobXTable";
import SampleManager from "../sampleManager";
import DefaultTooltip from "../../../shared/components/defaultTooltip/DefaultTooltip";
import {placeArrowBottomLeft} from "shared/components/defaultTooltip/DefaultTooltip";

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
    AGE = 'Age',
    CANCERTYPE = 'Cancer Type',
    ARM = 'Arm Description',
    MATCHINGCRITERIA = 'Genomic Alteration'
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
            [ColumnKey.TITLE]: 0.2 * this.props.containerWidth,
            [ColumnKey.INTERVENTIONS]: 0.16 * this.props.containerWidth,
            [ColumnKey.AGE]: 0.03 * this.props.containerWidth,
            [ColumnKey.CANCERTYPE]: 0.15 * this.props.containerWidth,
            [ColumnKey.ARM]: 0.1 * this.props.containerWidth,
            [ColumnKey.MATCHINGCRITERIA]: 0.26 * this.props.containerWidth
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
        width: this.columnsWidth[ColumnKey.ID]
    }, {
        name: ColumnKey.TITLE,
        render: (trial: IDetailedTrialMatch) => (
                <span>{trial.shortTitle}</span>
        ),
        width: this.columnsWidth[ColumnKey.TITLE]
    }, {
        name: ColumnKey.ARM,
        render: (trial: IDetailedTrialMatch) => (
            <If condition={trial.armDescription !== 'null'}>
                <span>{trial.armDescription}</span>
            </If>
        ),
        width: this.columnsWidth[ColumnKey.ARM]
    }, {
        name: ColumnKey.MATCHINGCRITERIA,
        render: (trial: IDetailedTrialMatch) => {
            const props = this.props;
            return <div>
                {trial.matches.map((clinicalGroupMatch: any, index: number) => (
                    <span>
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
                                        <span className={styles.genomicSpan}>
                                            {genomicGroupMatch.genomicAlteration + ' ( '}
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
                                            {')'}
                                        </span>
                                    </div>
                                </Else>
                            </If>
                        ))}
                        <If condition={clinicalGroupMatch.notMatches.length > 3}>
                            <Then>
                                <DefaultTooltip
                                    placement='bottomLeft'
                                    trigger={['hover', 'focus']}
                                    overlay={this.tooltipContent(clinicalGroupMatch.notMatches)}
                                    arrowContent={<div className="rc-tooltip-arrow-inner" />}
                                    destroyTooltipOnHide={false}
                                    onPopupAlign={placeArrowBottomLeft}
                                >
                                    {this.mainContent('NOT logic genomic alterations')}
                                </DefaultTooltip>
                            </Then>
                            <Else>
                                {clinicalGroupMatch.notMatches.map((genomicGroupMatch: any) => (
                                    <div className={styles.genomicSpan}><b>Not </b>{genomicGroupMatch.genomicAlteration.replace(/!/g, '',) + ' '}
                                        {genomicGroupMatch.matches[0].sampleIds.map((sampleId: string) => (
                                            <span className={styles.genomicSpan}>
                                                {props.sampleManager!.getComponentForSample(sampleId, 1, '')}
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </Else>
                        </If>
                    </span>
                ))}
                </div>
        },
        width: this.columnsWidth[ColumnKey.MATCHINGCRITERIA]
    }, {
        name: ColumnKey.AGE,
        render: (trial: IDetailedTrialMatch) => (
                <div>
                    {trial.matches.map((clinicalGroupMatch: any, index: number) => (
                        <span>{clinicalGroupMatch.trialAgeNumerical}</span>
                    ))}
                </div>
        ),
        width: this.columnsWidth[ColumnKey.AGE]
    }, {
        name: ColumnKey.CANCERTYPE,
        render: (trial: IDetailedTrialMatch) => (
            <div>
                {trial.matches.map((clinicalGroupMatch: any, index: number) => (
                    <span>{clinicalGroupMatch.trialOncotreePrimaryDiagnosis}</span>
                ))}
            </div>
        ),
        width: this.columnsWidth[ColumnKey.CANCERTYPE]
    }, {
        name: ColumnKey.INTERVENTIONS,
        render: (trial: IDetailedTrialMatch) => (
                <ul className={styles.diseasesUl}>
                    {trial.interventions.map((intervention: any) => (
                        <li>{intervention}</li>
                    ))}
                </ul>
        ),
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

            const groupByArm = _.groupBy(groupedMatches[key], 'armDescription');
            const aKeys = Object.keys(groupByArm).sort();
            _.forEach(aKeys, function(aKey) {
                let matchedTrialCopy = _.clone(matchedTrial);
                matchedTrialCopy['armDescription'] = aKey;
                matchedTrialCopy['matches'] = [];
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
                    matchedTrialCopy['matches'].push(clinicalGroupMatch);
                });
                matchedTrials.push(matchedTrialCopy);
            });

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

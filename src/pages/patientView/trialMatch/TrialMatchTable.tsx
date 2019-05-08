import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import {
    IClinicalGroupMatch, IGenomicGroupMatch, IGenomicMatch, ITrial,
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
    containerWidth: number;
    showControlArm: boolean;
}

export type ITrialMatchState = {
    detailedTrialMatches: Array<IDetailedTrialMatch>;
}

enum ColumnKey {
    ID = 'ID',
    TITLE = 'Title',
    MATCHINGCRITERIA = 'Matching Criteria'
}

class TrialMatchTableComponent extends LazyMobXTable<IDetailedTrialMatch> {

}

@observer
export default class TrialMatchTable extends React.Component<ITrialMatchProps, ITrialMatchState> {

    constructor(props: ITrialMatchProps) {
        super(props);
        this.state = { detailedTrialMatches: this.buildDetailedTrialMatches()};
    }

    @computed
    get columnsWidth() {
        return {
            [ColumnKey.ID]: 0.1 * this.props.containerWidth,
            [ColumnKey.TITLE]: 0.3 * this.props.containerWidth,
            [ColumnKey.MATCHINGCRITERIA]: 0.6 * this.props.containerWidth
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
        // download: (trial: IDetailedTrialMatch) => (trial.protocolNo + ', ' + trial.nctId + ', ' + trial.status),
        width: this.columnsWidth[ColumnKey.ID]
    }, {
        name: ColumnKey.TITLE,
        render: (trial: IDetailedTrialMatch) => (
                <span>{trial.shortTitle}</span>
        ),
        sortBy:(trial: IDetailedTrialMatch) => (trial.shortTitle),
        // download:(trial: IDetailedTrialMatch) => (trial.shortTitle),
        width: this.columnsWidth[ColumnKey.TITLE]
    }, {
        name: ColumnKey.MATCHINGCRITERIA,
        render: (trial: IDetailedTrialMatch) => {
            const props = this.props;
            return <div>
                {trial.matches.map((armMatch: any, index: number) => (
                    <div>
                        <div>
                            <div>
                                {armMatch.matches.map((clinicalGroupMatch: any, cgIndex:number) => (
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
                                                    overlay={this.tooltipGenomicContent(clinicalGroupMatch.notMatches)}
                                                    arrowContent={<div className="rc-tooltip-arrow-inner" />}
                                                    destroyTooltipOnHide={false}
                                                    onPopupAlign={placeArrowBottomLeft}
                                                >
                                                    {this.mainContent('No alterations in ' + this.getHugoSymbolName(clinicalGroupMatch.notMatches, 3) + ' defined by the trial')}
                                                </DefaultTooltip>
                                            </If>
                                        </span>
                                        <span className={styles.firstRight}>
                                            <span className={styles.secondLeft}>{clinicalGroupMatch.trialAgeNumerical + ' yrs old'}</span>
                                            <span className={styles.secondRight}>
                                                {clinicalGroupMatch.trialOncotreePrimaryDiagnosis.general.join(', ')}
                                                <If condition={clinicalGroupMatch.trialOncotreePrimaryDiagnosis.not.length > 0}>
                                                    <span>
                                                        <b> except in </b>
                                                        <If condition={clinicalGroupMatch.trialOncotreePrimaryDiagnosis.not.length < 4}>
                                                            <Then>
                                                                {clinicalGroupMatch.trialOncotreePrimaryDiagnosis.not.join(', ').replace(/,(?!.*,)/gmi, ' and')}
                                                            </Then>
                                                            <Else>
                                                                <DefaultTooltip
                                                                    placement='bottomLeft'
                                                                    trigger={['hover', 'focus']}
                                                                    overlay={this.tooltipClinicalContent(clinicalGroupMatch.trialOncotreePrimaryDiagnosis.not)}
                                                                    arrowContent={<div className="rc-tooltip-arrow-inner" />}
                                                                    destroyTooltipOnHide={false}
                                                                    onPopupAlign={placeArrowBottomLeft}
                                                                >
                                                                    {this.mainContent(clinicalGroupMatch.trialOncotreePrimaryDiagnosis.not.length + ' cancer types')}
                                                                </DefaultTooltip>
                                                            </Else>
                                                        </If>
                                                    </span>
                                                </If>
                                            </span>
                                        </span>
                                    <If condition={cgIndex < armMatch.matches.length - 1}><hr className={styles.criteriaHr}/></If>
                                    </span>
                                ))}
                            </div>
                             <If condition={armMatch.armDescription !== 'null'}>
                                <div className={styles.armDiv}>
                                 <span>Arm: {armMatch.armDescription}</span>
                                 </div>
                            </If>
                            <If condition={armMatch.drugs.length > 0}>
                                <div className={styles.armDiv}>
                                <span>Intervention: {armMatch.drugs.join(', ')}</span>
                                </div>
                            </If>
                        </div>
                        <If condition={index < trial.matches.length - 1}><hr className={styles.criteriaHr}/></If>
                    </div>
                ))}
                </div>
        },
        sortBy:(trial: IDetailedTrialMatch) => (trial.matches[0].armDescription),
        width: this.columnsWidth[ColumnKey.MATCHINGCRITERIA]
    }];

    public tooltipGenomicContent(data: Array<IGenomicGroupMatch>) {
        const props = this.props;
        return (
            <div style={{ maxHeight:400, maxWidth:600, overflow:'auto' }}>
                {data.map((genomicGroupMatch: any) => (
                    <div className={styles.genomicSpan}><b>Not </b>{genomicGroupMatch.genomicAlteration.replace(/!/g, '') + ' '}
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
    public tooltipClinicalContent(data: Array<string>) {
        return (
            <div style={{ maxHeight:400, maxWidth:600, overflow:'auto' }}>
                <ul className={styles.alterationUl}>
                    {data.map((cancerType: string) => (
                        <li>{cancerType}</li>
                    ))}
                </ul>
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
        return hugoSymbolSet.size + ' genes' ;
    }

    public buildDetailedTrialMatches() {
        const props = this.props;
        const groupByTrialId = _.groupBy(props.trialMatches, 'nctId');
        let matchedTrials: Array<IDetailedTrialMatch> = [];
        const trialIds = Object.keys(groupByTrialId);
        const hiddenArmTypes = ['Control Arm', 'Placebo Arm'];
        _.forEach(trialIds, function (trialId) {
            let matchedTrial:any = _.find( props.trials, { 'nctId': trialId } );
            matchedTrial['priority'] = 0; // highest priority
            matchedTrial['matches'] = [];
            const groupByArm = _.groupBy(groupByTrialId[trialId], 'armDescription');
            const armDescriptions = Object.keys(groupByArm);
            _.forEach(armDescriptions, function(armDescription) {
                let armMatch: IArmMatch = {
                    armDescription: armDescription,
                    drugs: [],
                    matches: []
                };
                if ( armDescription !== 'null' ) { // match for specific arm
                    const matchedArm = _.find( matchedTrial['treatmentList']['step'][0]['arm'], { 'arm_description': armDescription } );
                    if ( hiddenArmTypes.indexOf(matchedArm['arm_type']) < 0 ) {
                        if ( matchedArm[ 'drugs' ] ) {
                            armMatch.drugs.push( _.map( matchedArm[ 'drugs' ], 'name' ) );
                        }
                    } else {
                        return; // skip the hidden arm
                    }
                }

                const groupByAge = _.groupBy(groupByArm[armDescription], 'trialAgeNumerical');
                const ages = Object.keys(groupByAge);
                _.forEach(ages, function(age) {
                    const cancerTypes =  _.uniq(_.map(groupByAge[age], 'trialOncotreePrimaryDiagnosis'));
                    let generalCancerTypes: Array<string> = [];
                    let notCancerTypes: Array<string> = [];
                    _.map(cancerTypes, function(item) {
                       if (item.indexOf('!') !== -1) {
                           notCancerTypes.push(item.replace(/!/g, ''));
                       } else {
                           generalCancerTypes.push(item);
                       }
                    });
                    let clinicalGroupMatch: IClinicalGroupMatch = {
                        trialAgeNumerical: age,
                        trialOncotreePrimaryDiagnosis: {
                            general: generalCancerTypes,
                            not: notCancerTypes
                        },
                        matches: [],
                        notMatches: []
                    };
                    const groupByGenomicAlteration = _.groupBy(groupByAge[age], 'genomicAlteration');
                    const genomicAlterations = Object.keys(groupByGenomicAlteration);
                    _.forEach(genomicAlterations, function(genomicAlteration) {
                        const groupByPatientGenomic = _.groupBy(groupByGenomicAlteration[genomicAlteration], 'patientGenomic');
                        const patientGenomics = Object.keys(groupByPatientGenomic);
                        let genomicGroupMatch: IGenomicGroupMatch = {
                            genomicAlteration: genomicAlteration,
                            matches: []
                        };
                        _.forEach(patientGenomics, function(patientGenomic) {
                            let genomicMatch: IGenomicMatch = {
                                trueHugoSymbol: groupByPatientGenomic[patientGenomic][0].trueHugoSymbol,
                                trueProteinChange: groupByPatientGenomic[patientGenomic][0].trueProteinChange,
                                sampleIds: []
                            };
                            const sampleIds = _.uniq(_.map(groupByPatientGenomic[patientGenomic], 'sampleId'));
                            if (sampleIds.length > 1 && props.sampleManager) {
                                props.sampleManager.samples.map((item:any) => {
                                    if (sampleIds.includes(item.id)) {
                                        genomicMatch.sampleIds.push(item.id);
                                    }
                                });
                            } else {
                                genomicMatch.sampleIds = sampleIds;
                            }
                            genomicGroupMatch.matches.push(genomicMatch);
                        });
                        if(genomicAlteration.includes('!')) {
                            clinicalGroupMatch.notMatches.push(genomicGroupMatch);
                        } else {
                            clinicalGroupMatch.matches.push(genomicGroupMatch);
                        }
                    });
                    if (clinicalGroupMatch.notMatches.length > 0) {
                        if (clinicalGroupMatch.matches.length === 0) {
                            matchedTrial['priority'] += 2;
                        } else {
                            matchedTrial['priority']++;
                        }
                    }
                    armMatch.matches.push(clinicalGroupMatch);
                });
                matchedTrial['matches'].push(armMatch);
            });
            matchedTrials.push(matchedTrial);
        });
        matchedTrials.sort(function(a,b) {
            return a.priority - b.priority;
        });
        return matchedTrials;
    }

    render() {
        return (
            <TrialMatchTableComponent
                data={this.state.detailedTrialMatches}
                columns={this._columns}
                showCopyDownload={false}
            />
        )
    }
}

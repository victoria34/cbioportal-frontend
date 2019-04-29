import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import {
    IGenomicMatch, INctTrial, ITrial, ITrialMatch, IFlattenTrialMatch, IGenomicTypeMatch
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
    showControlArm: boolean;
}

export type ITrialMatchState = {
    flattenTrialMatches: Array<IFlattenTrialMatch>;
}

enum ColumnKey {
    ID = 'ID',
    TITLE = 'Title',
    INTERVENTIONS = 'Interventions',
    AGE = 'Age',
    CANCERTYPE = 'Cancer Type',
    GENOMIC = 'Genomic',
    ARM = 'Arm'
}

class TrialMatchTableComponent extends LazyMobXTable<IFlattenTrialMatch> {

}

@observer
export default class TrialMatchTable extends React.Component<ITrialMatchProps, ITrialMatchState> {

    constructor(props: ITrialMatchProps) {
        super(props);
        this.state = { flattenTrialMatches: this.flattenTrialMatches()};
    }

    @computed
    get columnsWidth() {
        return {
            [ColumnKey.ID]: 0.1 * this.props.containerWidth,
            [ColumnKey.TITLE]: 0.2 * this.props.containerWidth,
            [ColumnKey.ARM]: 0.15 * this.props.containerWidth,
            [ColumnKey.AGE]: 0.05 * this.props.containerWidth,
            [ColumnKey.CANCERTYPE]: 0.15 * this.props.containerWidth,
            [ColumnKey.GENOMIC]: 0.25 * this.props.containerWidth,
            [ColumnKey.INTERVENTIONS]: 0.1 * this.props.containerWidth,
        };
    }

    private _columns = [{
        name: ColumnKey.ID,
        render: (trial: IFlattenTrialMatch) => (
            <div>
                <span><a target="_blank" href={"https://www.mskcc.org/cancer-care/clinical-trials/" + trial.protocolNo}>{trial.protocolNo}</a></span><br/>
                <span><a target="_blank" href={"https://clinicaltrials.gov/ct2/show/" + trial.nctId}>{trial.nctId}</a></span><br/>
                <span>{trial.status}</span>
            </div>
        ),
        sortBy:(trial: IFlattenTrialMatch) => (trial.protocolNo),
        // download: (trial: IDetailedTrialMatch) => (trial.protocolNo + ', ' + trial.nctId + ', ' + trial.status),
        width: this.columnsWidth[ColumnKey.ID]
    }, {
        name: ColumnKey.TITLE,
        render: (trial: IFlattenTrialMatch) => (
                <span>{trial.shortTitle}</span>
        ),
        sortBy:(trial: IFlattenTrialMatch) => (trial.shortTitle),
        // download:(trial: IDetailedTrialMatch) => (trial.shortTitle),
        width: this.columnsWidth[ColumnKey.TITLE]
    }, {
        name: ColumnKey.ARM,
        render: (trial: IFlattenTrialMatch) => (
            <div>
                {trial.armDescriptions.map((description: any, index: number) => (
                    <div>
                        <span>{description}</span>
                        <If condition={index < trial.armDescriptions.length - 1}>
                            <hr className={styles.criteriaHr}/>
                        </If>
                    </div>
                ) )}
            </div>
        ),
        // sortBy:(trial: IDetailedTrialMatch) => (trial.interventions[0]),
        // download: (trial: IDetailedTrialMatch) => (trial.interventions.join(', ')),
        width: this.columnsWidth[ColumnKey.ARM]
    }, {
        name: ColumnKey.GENOMIC,
        render: (trial: IFlattenTrialMatch) => {
            const props = this.props;
            return <div>
                {trial.genomics.map( ( genomicGroupMatch: any, index: number ) => (
                    <div>
                        { genomicGroupMatch.type === 'general' ? (
                            <div>
                                <If condition={genomicGroupMatch.matches.length === 1 &&
                                genomicGroupMatch.genomicAlteration === genomicGroupMatch.matches[ 0 ].trueHugoSymbol + ' ' + genomicGroupMatch.matches[ 0 ].trueProteinChange}>
                                    <Then>
                                        <span>{genomicGroupMatch.genomicAlteration + ' '}
                                            {genomicGroupMatch.matches[ 0 ].sampleIds.map( ( sampleId: string ) => (
                                                <span className={styles.genomicSpan}>
                                                    {props.sampleManager!.getComponentForSample( sampleId, 1, '' )}
                                                </span>
                                            ) )}
                                        </span>
                                    </Then>
                                    <Else>
                                        <div>
                                            <span className={styles.genomicSpan + styles.firstLeft}>
                                                {genomicGroupMatch.genomicAlteration + ': '}
                                                <If condition={genomicGroupMatch.matches.length > 1}>
                                                    <Then>
                                                        <ul className={styles.alterationUl}>
                                                        {genomicGroupMatch.matches.map( ( genomicMatch: any) => (
                                                            <li>{genomicMatch.trueHugoSymbol + ' ' + genomicMatch.trueProteinChange + ' '}
                                                                {genomicMatch.sampleIds.map( ( sampleId: string ) => (
                                                                    <span className={styles.genomicSpan}>
                                                                        {props.sampleManager!.getComponentForSample( sampleId, 1, '' )}
                                                                    </span>
                                                                ) )}
                                                            </li>
                                                        ) )}
                                                        </ul>
                                                    </Then>
                                                    <Else>
                                                        <span>{genomicGroupMatch.matches[ 0 ].trueHugoSymbol + ' ' + genomicGroupMatch.matches[ 0 ].trueProteinChange + ' '}
                                                            {genomicGroupMatch.matches[ 0 ].sampleIds.map( ( sampleId: string ) => (
                                                                <span className={styles.genomicSpan}>
                                                                    {props.sampleManager!.getComponentForSample( sampleId, 1, '' )}
                                                                </span>
                                                            ) )}
                                                        </span>
                                                    </Else>
                                                </If>
                                            </span>
                                        </div>
                                    </Else>
                                </If>
                            </div>
                        ) : (
                            <div>
                                <If condition={genomicGroupMatch.matches.length > 0}>
                                    <DefaultTooltip
                                        placement='bottomLeft'
                                        trigger={[ 'hover', 'focus' ]}
                                        overlay={this.tooltipGenomicContent( genomicGroupMatch.matches )}
                                        arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                                        destroyTooltipOnHide={false}
                                        onPopupAlign={placeArrowBottomLeft}
                                    >
                                        {this.mainContent( 'No alterations in ' + this.getHugoSymbolName(  genomicGroupMatch.matches, 3 ) + ' defined by the trial' )}
                                    </DefaultTooltip>
                                </If>
                            </div>
                        )}
                        <If condition={index < trial.armDescriptions.length - 1}>
                            <hr className={styles.criteriaHr}/>
                        </If>
                    </div>
                ) )}
            </div>
        },
        // sortBy:(trial: IDetailedTrialMatch) => (trial.interventions[0]),
        // download: (trial: IDetailedTrialMatch) => (trial.interventions.join(', ')),
        width: this.columnsWidth[ColumnKey.GENOMIC]
    }, {
        name: ColumnKey.AGE,
        render: (trial: IFlattenTrialMatch) => (
            <div>
                {trial.ages.map((age: any, index: number) => (
                    <div>
                        <span>{age}</span>
                        <If condition={index < trial.armDescriptions.length - 1}>
                            <hr className={styles.criteriaHr}/>
                        </If>
                    </div>
                ))}
            </div>
        ),
        // sortBy:(trial: IDetailedTrialMatch) => (trial.interventions[0]),
        // download: (trial: IDetailedTrialMatch) => (trial.interventions.join(', ')),
        width: this.columnsWidth[ColumnKey.AGE]
    }, {
        name: ColumnKey.CANCERTYPE,
        render: (trial: IFlattenTrialMatch) => (
            <div>
                {trial.cancerTypes.map((cancerType: any, index: number) => (
                    <div>
                        <span>
                            {cancerType.general.join(', ')}
                            <If condition={cancerType.not.length > 0}>
                                <span>
                                    <b> except in </b>
                                    <If condition={cancerType.not.length < 4}>
                                        <Then>
                                            {cancerType.not.join(', ').replace(/,(?!.*,)/gmi, ' and')}
                                        </Then>
                                        <Else>
                                            <DefaultTooltip
                                                placement='bottomLeft'
                                                trigger={['hover', 'focus']}
                                                overlay={this.tooltipClinicalContent(cancerType.not)}
                                                arrowContent={<div className="rc-tooltip-arrow-inner" />}
                                                destroyTooltipOnHide={false}
                                                onPopupAlign={placeArrowBottomLeft}
                                            >
                                                {this.mainContent(cancerType.not.length + ' cancer types')}
                                            </DefaultTooltip>
                                        </Else>
                                    </If>
                                </span>
                            </If>
                        </span>
                        <If condition={index < trial.armDescriptions.length - 1}><hr className={styles.criteriaHr}/></If>
                    </div>
                ))}
            </div>
        ),
        // sortBy:(trial: IDetailedTrialMatch) => (trial.interventions[0]),
        // download: (trial: IDetailedTrialMatch) => (trial.interventions.join(', ')),
        width: this.columnsWidth[ColumnKey.CANCERTYPE]
    }, {
        name: ColumnKey.INTERVENTIONS,
        render: (trial: IFlattenTrialMatch) => (
            <div>
                {trial.interventions.map((interventions: any, index: number) => (
                    <div>
                        <If condition={interventions.length > 0}>
                            <span>
                                {interventions.map((intervention: any) => (
                                    <span>{intervention}</span>
                                ))}
                                <If condition={index < trial.armDescriptions.length - 1}><hr className={styles.criteriaHr}/></If>
                            </span>
                        </If>
                    </div>
                ))}
            </div>
        ),
        // sortBy:(trial: IDetailedTrialMatch) => (trial.interventions[0]),
        // download: (trial: IDetailedTrialMatch) => (trial.interventions.join(', ')),
        width: this.columnsWidth[ColumnKey.INTERVENTIONS]
    }];
    public tooltipGenomicContent(data: Array<IGenomicTypeMatch>) {
        const props = this.props;
        return (
            <div style={{ maxHeight:400, maxWidth:600, overflow:'auto' }}>
                {data.map((genomicTypeMatch: any) => (
                    <div className={styles.genomicSpan}><b>Not </b>{genomicTypeMatch.genomicAlteration.replace(/!/g, '') + ' '}
                        {genomicTypeMatch.matches[0].sampleIds.map((sampleId: string) => (
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

    public getHugoSymbolName(matches: Array<IGenomicTypeMatch>, threshold: number) {
        const hugoSymbolSet = new Set([...matches].map(x => x.genomicAlteration.split(' ')[0].slice(1)));
        if (hugoSymbolSet.size <= threshold) {
            return [...hugoSymbolSet].join(', ');
        }
        return hugoSymbolSet.size + ' genes' ;
    }

    public flattenTrialMatches() {
        const self = this;
        const groupedMatches = _.groupBy(self.props.trialMatches, 'nctId');
        let matchedTrials: Array<IFlattenTrialMatch> = [];
        const trialIds = Object.keys(groupedMatches);
        _.forEach(trialIds, function (trialId) {
            let trial: any = _.find( self.props.trials, { 'nctId': trialId } );
            let matchedTrial: IFlattenTrialMatch = {
                nctId: trial.nctId,
                protocolNo: trial.protocolNo,
                shortTitle: trial.shortTitle,
                status: trial.status,
                armDescriptions: [],
                genomics: [],
                ages: [],
                cancerTypes:[],
                interventions: [],
                priority: 0 // highest priority
            };
            const groupByArm = _.groupBy(groupedMatches[trialId], 'armDescription');
            const armDescriptions = Object.keys( groupByArm );
            _.forEach(armDescriptions, function(armDescription) {
                if ( armDescription !== 'null' ) { // match for specific arm
                    const matchedArm = _.find( trial['treatmentList']['step'][0]['arm'], { 'arm_description': armDescription } );
                    if (matchedArm['arm_type'] !== 'Control Arm') {
                        if ( matchedArm[ 'drugs' ] ) {
                            matchedTrial.interventions.push( _.map( matchedArm[ 'drugs' ], 'name' ));
                        }
                        matchedTrial.armDescriptions.push(armDescription);
                        self.getMatchDetails(matchedTrial, groupByArm, armDescription);
                    }
                } else {
                    self.getMatchDetails(matchedTrial, groupByArm, armDescription);
                }
            });

            matchedTrials.push(matchedTrial);
        });
        matchedTrials.sort(function(a,b) {
            return a.priority - b.priority;
        });

        return matchedTrials;
    }

    public getMatchDetails(matchedTrial: any, groupByArm: any, armDescription: string) {
        const props = this.props;
        const groupByAge = _.groupBy( groupByArm[ armDescription ], 'trialAgeNumerical' );
        const ages = Object.keys( groupByAge );
        _.forEach( ages, function( age ) {
            const cancerTypes = _.uniq( _.map( groupByAge[ age ], 'trialOncotreePrimaryDiagnosis' ) );
            let generalCancerTypes: Array<string> = [];
            let notCancerTypes: Array<string> = [];
            _.map( cancerTypes, function( item ) {
                if ( item.indexOf( '!' ) !== - 1 ) {
                    notCancerTypes.push( item.replace( /!/g, '' ) );
                } else {
                    generalCancerTypes.push( item );
                }
            } );
            if (age === 'null') {
                matchedTrial.ages.push( '' );
            } else {
                matchedTrial.ages.push( age );
            }

            matchedTrial.cancerTypes.push( {
                general: generalCancerTypes,
                not: notCancerTypes
            } );
            let matches: Array<IGenomicTypeMatch> = [];
            let notMatches: Array<IGenomicTypeMatch> = [];
            const groupByGenomicAlteration = _.groupBy( groupByAge[ age ], 'genomicAlteration' );
            const genomicAlterations = Object.keys( groupByGenomicAlteration );
            _.forEach( genomicAlterations, function( genomicAlteration ) {
                const groupByPatientGenomic = _.groupBy( groupByGenomicAlteration[ genomicAlteration ], 'patientGenomic' );
                const patientGenomics = Object.keys( groupByPatientGenomic );
                let genomicTypeMatch: IGenomicTypeMatch = {
                    genomicAlteration: genomicAlteration,
                    matches: [],
                    type: ''
                };
                _.forEach( patientGenomics, function( patientGenomic ) {
                    let genomicMatch: IGenomicMatch = {
                        trueHugoSymbol: groupByPatientGenomic[ patientGenomic ][ 0 ].trueHugoSymbol,
                        trueProteinChange: groupByPatientGenomic[ patientGenomic ][ 0 ].trueProteinChange,
                        sampleIds: []
                    };
                    const sampleIds = _.uniq( _.map( groupByPatientGenomic[ patientGenomic ], 'sampleId' ) );
                    if ( sampleIds.length > 1 && props.sampleManager ) {
                        props.sampleManager.samples.map( ( item: any ) => {
                            if ( sampleIds.includes( item.id ) ) {
                                genomicMatch.sampleIds.push( item.id );
                            }
                        } );
                    } else {
                        genomicMatch.sampleIds = sampleIds;
                    }
                    genomicTypeMatch.matches.push( genomicMatch );
                } );
                if ( genomicAlteration.includes( '!' ) ) {
                    genomicTypeMatch.type = 'not';
                    notMatches.push( genomicTypeMatch );
                } else {
                    genomicTypeMatch.type = 'general';
                    matches.push( genomicTypeMatch );
                }
            } );
            if ( matches.length > 0 ) {
                matchedTrial.genomics = _.concat(matchedTrial.genomics, matches);
            }
            if ( notMatches.length > 0 ) {
                // Group all not matches together as an object
                matchedTrial.genomics.push( {
                    genomicAlteration: '',
                    matches: notMatches,
                    type: 'not'
                } );
                if ( matches.length === 0 ) {
                    matchedTrial.priority += 2;
                } else {
                    matchedTrial.priority ++;
                }
            }
        } );
    }

    render() {
        return (
            <TrialMatchTableComponent
                data={this.state.flattenTrialMatches}
                columns={this._columns}
                showCopyDownload={false}
            />
        )
    }
}

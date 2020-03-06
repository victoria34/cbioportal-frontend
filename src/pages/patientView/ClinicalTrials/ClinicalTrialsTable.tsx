import * as React from 'react';
import * as _ from "lodash";
import {ICache} from "cbioportal-frontend-commons";
import { If, Then, Else } from 'react-if';
import {observer} from "mobx-react";
import { computed } from "mobx";
import OncoKbEvidenceCache from "shared/cache/OncoKbEvidenceCache";
import { IOncoKbCancerGenesWrapper, IOncoKbDataWrapper } from "shared/model/OncoKB";
import { Mutation } from "shared/api/generated/CBioPortalAPI";
import {
    Query
} from "cbioportal-frontend-commons";
import {getEvidenceQuery} from "shared/lib/OncoKbUtils";
import LazyMobXTable from "shared/components/lazyMobXTable/LazyMobXTable";
import AnnotationColumnFormatter from "shared/components/mutationTable/column/AnnotationColumnFormatter";
import {
    generateTreatments, getTrialStatusColor, matchTrials
} from "../../../../packages/react-mutation-mapper/src/util/OncoKbUtils";
import { OncoKbTreatment } from "../../../../packages/react-mutation-mapper/src/model/OncoKb";
import { MobxCache } from "../../../../packages/react-mutation-mapper/src/model/MobxCache";
import mainStyles from './ClinicalTrialsTable.module.scss';
import { IAnnotation } from "../../../../packages/react-mutation-mapper/src/component/column/Annotation";

export type IClinicalTrialsTableProps = {
    mutations: Mutation[][],
    trialsCache:MobxCache;
    oncoKbEvidenceCache:OncoKbEvidenceCache;
    oncoKbCancerGenes:IOncoKbCancerGenesWrapper;
    oncoKbData: IOncoKbDataWrapper;
    containerWidth: number;
}

export type ICriterion = {
    treatment: string;
    hugoSymbol: string;
    variant: string[];
    cancerType: string;
};


export type IMatchedClinicalTrial = {
    criteria: ICriterion[];
    briefTitle: string;
    currentTrialStatus: string;
    nctId: string;
};


enum ColumnKey {
    TRIAL = 'Trial',
    MATCHING_CRITERIA = 'Matching Criteria',
}

@observer
export default class ClinicalTrialsTable extends React.Component<IClinicalTrialsTableProps, {}> {

    @computed
    get columnWidths() {
        return {
            [ColumnKey.TRIAL]: 0.4 * this.props.containerWidth,
            [ColumnKey.MATCHING_CRITERIA]: 0.6 * this.props.containerWidth
        };
    }

    private _columns = [{
        name: ColumnKey.TRIAL,
        render: (trial: IMatchedClinicalTrial) => (
            <div>
                <If condition={trial.nctId.length > 0}>
                    <div>
                        <a target="_blank" href={"https://clinicaltrials.gov/ct2/show/" + trial.nctId}>{trial.nctId}</a>
                        <span className={mainStyles["status-margin"]} style={getTrialStatusColor(trial.currentTrialStatus)}>{trial.currentTrialStatus}</span>
                    </div>
                </If>
                <p>{trial.briefTitle}</p>
            </div>
        ),
        width: this.columnWidths[ColumnKey.TRIAL]
    }, {
        name: ColumnKey.MATCHING_CRITERIA,
        render: (trial: IMatchedClinicalTrial) => (
            <div>
                {trial.criteria.map((criterion:ICriterion) => (
                    <div className="row" style={{marginLeft:0}}>
                        <span className="col-md-1" style={{paddingLeft:0}}>{criterion.hugoSymbol}</span>
                        <span className="col-md-3">{criterion.variant.join(', ')}</span>
                        <span className="col-md-4" style={{fontWeight: 'bold'}}>{criterion.treatment}</span>
                        <span className="col-md-4">{criterion.cancerType}</span>
                    </div>
                ))}
            </div>
        ),
        width: this.columnWidths[ColumnKey.MATCHING_CRITERIA]
    }];

    public getAnnotation(rowData:Mutation[]|undefined,
        oncoKbCancerGenes?:IOncoKbCancerGenesWrapper,
        oncoKbData?:IOncoKbDataWrapper): IAnnotation
    {
        return AnnotationColumnFormatter.getData(rowData, oncoKbCancerGenes,
        undefined,
        undefined,
        oncoKbData,
        undefined,
        undefined,
        undefined);
    }

    public getEvidenceQueryByMutatios(mutations: Mutation[]): Query | undefined {
        let evidenceQuery:Query|undefined;

        if (this.props.oncoKbData &&
            this.props.oncoKbData.result &&
            !(this.props.oncoKbData.result instanceof Error))
        {
            evidenceQuery = getEvidenceQuery(mutations[0], this.props.oncoKbData.result);
            evidenceQuery.hugoSymbol = mutations[0].gene.hugoGeneSymbol;
        }
        return evidenceQuery;
    }

    public get treatmentQueries(): ICriterion[] {
        const treatmentQueries: ICriterion[] = [];
        this.props.mutations.forEach( (mutations: Mutation[]) => {
            const annotation:IAnnotation = this.getAnnotation(
                mutations,
                this.props.oncoKbCancerGenes,
                this.props.oncoKbData);
            const evidenceQuery = this.getEvidenceQueryByMutatios(mutations);
            if (annotation.isOncoKbCancerGene && annotation.oncoKbGeneExist) {
                if (this.props.oncoKbEvidenceCache && evidenceQuery)
                {
                    const cache = this.props.oncoKbEvidenceCache.getData([evidenceQuery.id], [evidenceQuery]);
                    if (cache[evidenceQuery.id] && cache[evidenceQuery.id].status === 'complete') {
                        const data = cache[evidenceQuery.id].data;
                        const treatments = generateTreatments(data.treatments);
                        const filterTreatmentsByTumorType = treatments.filter((treatment:OncoKbTreatment) => treatment.cancerType === evidenceQuery.tumorType);
                        filterTreatmentsByTumorType.map((treatment:OncoKbTreatment) => {
                            treatmentQueries.push({
                                treatment: treatment.treatment,
                                hugoSymbol: evidenceQuery.hugoSymbol,
                                variant: treatment.variant,
                                cancerType: treatment.cancerType
                            })
                        });
                    }
                }
            }

        });
        return _.uniq(treatmentQueries);
    }

    public get trialsData(): ICache<any>
    {
        if (this.props.trialsCache && this.treatmentQueries) {
            const cancerTypes: string[] = _.uniq(this.treatmentQueries.map((treatmentQuery: ICriterion)=>treatmentQuery.cancerType));
            for (const cancerType of cancerTypes) {
                this.props.trialsCache.get(cancerType);
            }
        }

        return (this.props.trialsCache && this.props.trialsCache.cache) || {};
    }

    render() {
        const matchedTrials: {[key:string]: IMatchedClinicalTrial} = {};
        const trialsCache: ICache<any> = this.trialsData;

        this.treatmentQueries.forEach((treatmentQuery:ICriterion)=> {
            if (trialsCache) {
                const trialsData = trialsCache[treatmentQuery.cancerType];
                if(trialsData && trialsData.data) {
                    const trials = matchTrials( trialsData.data, treatmentQuery.treatment );
                    if ( trials.length > 0 ) {
                        trials.forEach( ( trial ) => {
                            if ( matchedTrials[ trial.nctId ] ) {
                                matchedTrials[ trial.nctId ].criteria.push( treatmentQuery );
                            } else {
                                matchedTrials[ trial.nctId ] = {
                                    criteria: [ treatmentQuery ],
                                    briefTitle: trial.briefTitle,
                                    currentTrialStatus: trial.currentTrialStatus,
                                    nctId: trial.nctId
                                }
                            }
                        } );
                    }
                }
            }
        });
        return (
            <LazyMobXTable
                data={Object.values(matchedTrials)}
                columns={this._columns}
                showCopyDownload={false}
            />
        )
    }
}

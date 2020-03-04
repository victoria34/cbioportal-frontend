import autobind from "autobind-decorator";
import {DefaultTooltip} from "cbioportal-frontend-commons";
import * as React from "react";
import {observable} from "mobx";
import {observer} from "mobx-react";

import {MobxCache} from "../../model/MobxCache";
import { Query, IEvidence, OncoKbTreatment } from "../../model/OncoKb";
import {SimpleCache} from "../../model/SimpleCache";
import {errorIcon, loaderIcon} from "../StatusHelpers";
import './oncokb.scss';
import 'oncokb-styles/dist/oncokb.css';
import { extractCancerTypes, generateTreatments, hideArrow, matchedTrials } from "../../util/OncoKbUtils";
import {ICache, ICacheData} from "cbioportal-frontend-commons";
import mainStyles from './main.module.scss';
import TrialsTable from "./TrialsTable";
import { PillTag } from "../../../../../src/shared/components/PillTag/PillTag";
import { IMatchedTrials } from "../../model/NcitTrial";
import oncoKbLogoImgSrc from '../../images/oncokb_logo.png';

export interface IClinicalTrialsProps {
    status: "pending" | "error" | "complete";
    evidenceCache?: SimpleCache;
    evidenceQuery?: Query;
    trialsCache?: MobxCache;
    hugoGeneSymbol: string;
}

@observer
export default class ClinicalTrials extends React.Component<IClinicalTrialsProps, {}>
{
    private matchedTrials: {[key:string]: IMatchedTrials} = {};
    @observable selectedTreatment: string = '';
    private oncokbLogo = <img src={oncoKbLogoImgSrc} className={mainStyles["oncokb-logo"]} alt="OncoKB"/>;

    public get evidenceCacheData(): ICacheData<IEvidence>|undefined
    {
        let cacheData: ICacheData<IEvidence>|undefined;

        if (this.props.evidenceCache && this.props.evidenceQuery)
        {
            const cache = this.props.evidenceCache.getData([this.props.evidenceQuery.id], [this.props.evidenceQuery]);

            if (cache) {
                cacheData = cache[this.props.evidenceQuery.id];
            }
        }

        return cacheData;
    }

    public get trialsData(): ICache<any>
    {
        if (this.props.trialsCache && this.evidenceCacheData) {
            const cancerTypes = extractCancerTypes(this.evidenceCacheData.data);
            for (const cancerType of cancerTypes) {
                this.props.trialsCache.get(cancerType);
            }
        }

        return (this.props.trialsCache && this.props.trialsCache.cache) || {};
    }

    public render()
    {
        const cacheData: ICacheData<IEvidence>|undefined = this.evidenceCacheData;

        let ctContent:JSX.Element = <span/>;

        if (!cacheData)
        {
            return ctContent;
        }

        if (this.props.status === "error") {
            ctContent = errorIcon("Error fetching Trials data");
        }
        else if (this.props.status === "pending") {
            ctContent = loaderIcon("pull-left");
        }
        else {
            if (cacheData.status === 'complete' && cacheData.data && this.props.evidenceCache && this.props.evidenceQuery)
            {
                const treatments = generateTreatments(cacheData.data.treatments);
                const filterTreatmentsByTumorType = treatments.filter((treatment) => treatment.cancerType === this.props.evidenceQuery.tumorType);
                const trialsCache: ICache<any> = this.trialsData;
                const trialsData = trialsCache[this.props.evidenceQuery.tumorType];

                if (filterTreatmentsByTumorType && filterTreatmentsByTumorType.length > 0 && trialsData && trialsData.data) {
                    const treatmentButtonList: JSX.Element[] = [];

                    filterTreatmentsByTumorType.forEach( ( treatment: OncoKbTreatment ) => {
                        const trials = matchedTrials( trialsData.data, treatment.treatment );
                        if ( trials.length > 0 ) {
                            if (this.selectedTreatment === '') {
                                this.selectedTreatment = treatment.treatment; // the selected treatment is the 1st treatment by default
                            }
                            this.matchedTrials[treatment.treatment] = {
                                treatment: treatment.treatment,
                                trials: trials
                            };
                            treatmentButtonList.push(
                                <div
                                    className={mainStyles["treatment-pill-tag"]}
                                    onClick={() => this.selectedTreatment = treatment.treatment}
                                >
                                    <PillTag
                                        border="1px solid #1c75cd"
                                        defaultContentColor="#1c75cd"
                                        content={`${treatment.treatment}: ${trials.length} trials`}
                                        backgroundColor={treatment.treatment === this.selectedTreatment ? '#1c75cd' : '#ffffff'}
                                    />
                                </div>
                            );
                        }
                    } );

                    if ( Object.keys(this.matchedTrials).length > 0) {
                        ctContent = (
                            <DefaultTooltip
                                overlayClassName="oncokb-tooltip"
                                overlay={this.tooltipContent( this.props.hugoGeneSymbol, this.props.evidenceQuery, treatmentButtonList )}
                                placement="right"
                                trigger={[ 'hover', 'focus' ]}
                                onPopupAlign={hideArrow}
                                destroyTooltipOnHide={true}
                            >
                            <span style={{
                                width: 22,
                                display: 'flex',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                color: 'green'
                            }}>CT</span>
                            </DefaultTooltip>
                        );
                    }
                }
            }
        }

        return ctContent;
    }

    @autobind
    private tooltipContent(hugoSymbol: string, evidenceQuery: Query, treatmentButtons: JSX.Element[]): JSX.Element
    {
        let tooltipContent: JSX.Element = <span />;
        tooltipContent =
            <div className={mainStyles["oncokb-card"]} >
                <div className={mainStyles["clinical-trial-refs"]}>
                    <div className={mainStyles["title"]} data-test="oncokb-card-title">
                        {`${hugoSymbol} ${evidenceQuery.alteration}`} in <span className={mainStyles["orange-icon"]}>{evidenceQuery.tumorType}</span>
                    </div>
                    <div style={{margin: 10, display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
                        {treatmentButtons}
                    </div>
                    <div style={{margin: 10}}>
                        <span style={{fontWeight: 'bold'}}>
                            Clinical Trials of <span className={mainStyles["orange-icon"]}>{this.selectedTreatment}</span> : {this.matchedTrials[this.selectedTreatment].trials.length} trials <br/>
                        </span>
                        <TrialsTable trials={this.matchedTrials[this.selectedTreatment].trials}/>
                    </div>
                    <div style={{marginTop: 10, marginBottom: 10}} >
                        <a href={"https://oncokb.org"} target="_blank">
                            {this.oncokbLogo}
                        </a>
                    </div>
                </div>
            </div>;

        return tooltipContent;
    }
}

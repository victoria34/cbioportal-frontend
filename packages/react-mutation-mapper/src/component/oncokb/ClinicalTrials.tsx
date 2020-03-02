import autobind from "autobind-decorator";
import {DefaultTooltip} from "cbioportal-frontend-commons";
import * as React from "react";
import {observable} from "mobx";
import {observer} from "mobx-react";

import {MobxCache} from "../../model/MobxCache";
import { IndicatorQueryResp, Query, IEvidence, OncoKbTreatment } from "../../model/OncoKb";
import {SimpleCache} from "../../model/SimpleCache";
import {errorIcon, loaderIcon} from "../StatusHelpers";
import './oncokb.scss';
import 'oncokb-styles/dist/oncokb.css';
import { extractCancerTypes, generateTreatments, hideArrow, matchedTrials } from "../../util/OncoKbUtils";
import {ICache, ICacheData} from "cbioportal-frontend-commons";
import TrialsList from "./TrialsList";
import mainStyles from './main.module.scss';
import TrialsTable from "./TrialsTable";

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
                const trialsCache: ICache<any> = this.trialsData;
                const trialsData = trialsCache[this.props.evidenceQuery.tumorType];

                if (treatments.length > 0 && trialsData && trialsData.data) {
                    ctContent = (
                        <DefaultTooltip
                            overlayClassName="oncokb-tooltip"
                            overlay={this.tooltipContent(trialsData, treatments, this.props.evidenceQuery.tumorType)}
                            placement="right"
                            trigger={['hover', 'focus']}
                            onPopupAlign={hideArrow}
                            destroyTooltipOnHide={true}
                        >
                            <span style={{width: 22, display: 'flex', justifyContent: 'space-around', alignItems: 'center', color: 'green'}}>CT</span>
                        </DefaultTooltip>
                    );
                }
            }
        }

        return ctContent;
    }

    @autobind
    private tooltipContent(trialsData: any, treatments: OncoKbTreatment[], tumorType: string): JSX.Element
    {
        let tooltipContent: JSX.Element = <span />;
        const list: JSX.Element[] = [];

        treatments.forEach((treatment: OncoKbTreatment) => {
            const trials = matchedTrials(trialsData.data, treatment.treatment);
            if (trials.length > 0) {
                list.push(
                    <div style={{marginTop: 10, marginBottom: 10}}>
                        <span style={{fontWeight: 'bold'}}>
                            Clinical Trials of <span className={mainStyles["orange-icon"]}>{treatment.treatment}</span> : {trials.length} trials <br/>
                        </span>
                        <TrialsTable trials={trials}/>
                    </div>
                );
            }
        });
        tooltipContent =
            <div className={mainStyles["oncokb-card"]} >
                <div className={mainStyles["clinical-trial-refs"]}>
                    <div className={mainStyles["title"]} data-test="oncokb-card-title">
                        Clinical Trials for <span className={mainStyles["orange-icon"]}>{tumorType}</span>
                    </div>
                    <div style={{marginLeft: 10, marginRight: 10}}>
                        {list}
                    </div>
                </div>
            </div>;

        // treatments.forEach((treatment) => {
        //     list.push(
        //         <div>
        //             <TrialsList
        //                 cancerType={tumorType}
        //                 treatment={treatment.treatment}
        //                 trialsData={trialsData}
        //             />
        //         </div>
        //     );
        // });
        // tooltipContent = <div className={mainStyles["tooltip-refs"]}>{list}</div>;

        return tooltipContent;
    }
}

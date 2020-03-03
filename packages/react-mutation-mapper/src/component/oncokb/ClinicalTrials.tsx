import autobind from "autobind-decorator";
import {DefaultTooltip} from "cbioportal-frontend-commons";
import * as React from "react";
import {observer} from "mobx-react";

import {MobxCache} from "../../model/MobxCache";
import { Query, IEvidence, OncoKbTreatment } from "../../model/OncoKb";
import {SimpleCache} from "../../model/SimpleCache";
import {errorIcon, loaderIcon} from "../StatusHelpers";
import './oncokb.scss';
import 'oncokb-styles/dist/oncokb.css';
import { extractCancerTypes, generateTreatments, hideArrow, matchTrialsByTreatment } from "../../util/OncoKbUtils";
import {ICache, ICacheData} from "cbioportal-frontend-commons";
import mainStyles from './main.module.scss';
import TrialsTable from "./TrialsTable";
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
                    const trials: IMatchedTrials[] = [];

                    filterTreatmentsByTumorType.forEach((treatment: OncoKbTreatment) => {
                        const matchedTrials = matchTrialsByTreatment(trialsData.data, treatment.treatment);
                        if (matchedTrials.length > 0) {
                            trials.push({
                                treatment: treatment.treatment,
                                trials: matchedTrials
                            });
                        }
                    });
                    if (trials.length > 0) {
                        ctContent = (
                            <DefaultTooltip
                                overlayClassName="oncokb-tooltip"
                                overlay={this.tooltipContent( trials, this.props.evidenceQuery.tumorType )}
                                placement="right"
                                visible={true}
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
    private tooltipContent(trials: IMatchedTrials[], tumorType: string): JSX.Element
    {
        const oncokbLogo = <img src={oncoKbLogoImgSrc} className={mainStyles["oncokb-logo"]} alt="OncoKB"/>;
        return (
            <div className={mainStyles["oncokb-card"]} >
                <div className={mainStyles["clinical-trial-refs"]}>
                    <div className={mainStyles["title"]} data-test="oncokb-card-title">
                        Clinical Trials for <span className={mainStyles["orange-icon"]}>{tumorType}</span>
                    </div>
                    <div style={{margin: 10}}>
                        <p>Drugs listed in the table below are coming from OncoKB website. Please hover on the OncoKB
                            card(on the left of CT icon) to see more treatment details.</p>
                        <div>
                            <TrialsTable trials={trials}/>
                        </div>
                        <div style={{marginTop: 10, marginBottom: 10}} >
                            <a href={"https://oncokb.org"} target="_blank">
                                {oncokbLogo}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

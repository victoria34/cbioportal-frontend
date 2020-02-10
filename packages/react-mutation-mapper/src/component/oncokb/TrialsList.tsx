import {ICache} from "cbioportal-frontend-commons";
import * as React from 'react';
import * as _ from 'lodash';
import { IDrug, ITrial, ITrialsByDrug } from "../../model/NcitTrial";
import {DefaultTooltip} from "cbioportal-frontend-commons";
import { observer } from "mobx-react";
import { computed } from "mobx";
import TrialItem from "./TrialItem";
import mainStyles from './main.module.scss';

type TrialsListProps = {
    cancerType: string;
    treatment: string;
    trialsData: ICache<any>;
}

@observer
export default class TrialsList extends React.Component<TrialsListProps> {

    @computed get matchedTrials() {
        const trials: ITrialsByDrug = {};
        const cacheData = this.props.trialsData![ this.props.cancerType ];
        let drugNames: string[] = [];
        if (this.props.treatment.includes('+') || this.props.treatment.includes(',')){
            drugNames = _.uniq(_.flatten(_.values(this.props.treatment.split(/\s?[,]\s?/).map( (drugs: string) =>
                drugs.split(/\s?[+]\s?/)))));
        } else {
            drugNames.push(this.props.treatment);
        }
        const trialsContent: ITrial[] = cacheData.data;
        trialsContent.forEach((trial: ITrial) => {
            const trialDrugNames = trial.drugs.map((drug:IDrug) => drug.drugName);
            if (_.difference(drugNames, trialDrugNames).length === 0) {
                if(_.isUndefined(trials[this.props.treatment])){
                    trials[this.props.treatment] = [];
                }
                trials[this.props.treatment].push(trial);
            }
        });

        return trials;
    }

    render() {
        let tooltipContent: JSX.Element = <span />;
        const list: JSX.Element[] = [];

        if (!_.isUndefined(this.props.trialsData) && !_.isUndefined(this.props.trialsData[ this.props.cancerType ])) {
            const cacheData = this.props.trialsData![ this.props.cancerType ];
            if ( cacheData.status === 'complete' && Object.keys(this.matchedTrials).length > 0) {
                Object.keys(this.matchedTrials).forEach((treatment:string)=>{
                    const trialsList: JSX.Element[] = [];
                    this.matchedTrials[treatment].forEach((trial:ITrial)=> {
                        trialsList.push(
                            <TrialItem
                                title={trial.briefTitle}
                                status={trial.currentTrialStatus}
                                nctId={trial.nctId}
                            />);
                    });
                    list.push(
                        <div>
                            <span style={{fontWeight: 'bold'}}>
                                Clinical Trials of <span className={mainStyles["orange-icon"]}>{treatment}</span> in <span className={mainStyles["orange-icon"]}>{this.props.cancerType}</span> : {trialsList.length} trials <br/>
                            </span>
                            {trialsList}
                        </div>);
                });
                tooltipContent = <div className={mainStyles["tooltip-refs"]}>{list}</div>;
            } else if ( cacheData.status === 'pending' ) {
                tooltipContent = <i className="fa fa-spinner fa-spin"/>;
            }
        }

        return tooltipContent;
    }
}

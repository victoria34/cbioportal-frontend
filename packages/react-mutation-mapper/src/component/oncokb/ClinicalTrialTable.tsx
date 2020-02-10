import {ICache} from "cbioportal-frontend-commons";
import * as React from 'react';
import * as _ from 'lodash';
import { IDrug, ITrial, ITrialsByDrug } from "../../model/NcitTrial";
import {defaultArraySortMethod, defaultSortMethod} from "../../util/ReactTableUtils";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { OncoKbTreatment } from "../../model/OncoKb";
import ReactTable from "react-table";
import mainStyles from './main.module.scss';

type ClinicalTrialTableProps = {
    cancerType: string;
    treatments: OncoKbTreatment[];
    trialsData: ICache<any>;
};

@observer
export default class ClinicalTrialTable extends React.Component<ClinicalTrialTableProps> {

    @computed get matchedTrials() {
        const trials: ITrialsByDrug = {};
        const cacheData = this.props.trialsData![ this.props.cancerType ];
        let drugNames: string[] = [];
        this.props.treatments.forEach((treatment: OncoKbTreatment) => {
            if (treatment.treatment.includes('+') || treatment.treatment.includes(',')){
                drugNames = _.uniq(_.flatten(_.values(treatment.treatment.split(/\s?[,]\s?/).map( (drugs: string) =>
                    drugs.split(/\s?[+]\s?/)))));
            } else {
                drugNames.push(treatment.treatment);
            }
            const trialsContent: ITrial[] = cacheData.data;
            trialsContent.forEach((trial: ITrial) => {
                const trialDrugNames = trial.drugs.map((drug:IDrug) => drug.drugName);
                if (_.difference(drugNames, trialDrugNames).length === 0) {
                    if(_.isUndefined(trials[treatment.treatment])){
                        trials[treatment.treatment] = [];
                    }
                    trials[treatment.treatment].push(trial);
                }
            });
        });

        return trials;
    }

    readonly columns = [
        {
            id: "id",
            Header: <span><b>NCT #</b></span>,
            accessor: "nctId",
            maxWidth: 100,
            sortMethod: (a: string, b: string) => defaultSortMethod(a, b),
            Cell: (props: {original: ITrial}) =>
                <a
                    href={`https://clinicaltrials.gov/ct2/show/${props.original.nctId}`}
                    target="_blank"
                >
                    <b>{props.original.nctId}</b>
                </a>
        },
        {
            id: "status",
            Header: <span><b>Status</b></span>,
            accessor: "currentTrialStatus",
            minWidth: 80,
            style: {color: "green", textAlign: "center" },
            Cell: (props: {original: ITrial}) =>
                <span>{props.original.currentTrialStatus}</span>

        },
        {
            id: "Title",
            Header: <span><b>Title</b></span>,
            accessor: "briefTitle",
            Cell: (props: {original: ITrial}) =>
                <span>{props.original.briefTitle}</span>
        }
    ];

    public render() {
        let tooltipContent: JSX.Element = <span />;
        const list: JSX.Element[] = [];
        if (!_.isUndefined(this.props.trialsData) && !_.isUndefined(this.props.trialsData[ this.props.cancerType ])) {
            const cacheData = this.props.trialsData![ this.props.cancerType ];
            if ( cacheData.status === 'complete' && Object.keys(this.matchedTrials).length > 0) {
                this.props.treatments.forEach((treatment:OncoKbTreatment)=>{
                    const trials: ITrial[] = this.matchedTrials[treatment.treatment];
                    list.push(
                        <div>
                            <span style={{fontWeight: 'bold'}}>
                                Clinical Trials of <span className={mainStyles["orange-icon"]}>{treatment.treatment}</span> in <span className={mainStyles["orange-icon"]}>{this.props.cancerType}</span> : {trials.length} trials <br/>
                            </span>
                            <ReactTable
                                data={trials}
                                columns={this.columns}
                                defaultSorted={[{
                                    id: "id",
                                    desc: true
                                }]}
                                showPagination={false}
                                pageSize={trials.length}
                                className="-striped -highlight"
                            />
                        </div>);
                });
                tooltipContent = <div>{list}</div>;
            } else if ( cacheData.status === 'pending' ) {
                tooltipContent = <i className="fa fa-spinner fa-spin"/>;
            }
        }

        return tooltipContent;
    }
}

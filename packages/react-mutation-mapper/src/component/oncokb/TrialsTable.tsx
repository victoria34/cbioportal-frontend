import {observer} from "mobx-react";
import * as React from 'react';
import ReactTable from "react-table";
import "./oncoKbTreatmentTable.scss";
import { IMatchedTrials, ITrial } from "../../model/NcitTrial";
import styles from './listGroupItem.module.scss';

type TrialsTableProps = {
    trials: IMatchedTrials[];
};


@observer
export default class TrialsTable extends React.Component<TrialsTableProps> {

    getContentColor(content: string) {
        console.log(content);
        content = content.toLowerCase();
        if (content.includes('open') || content.includes('active')) {
            return {color: 'green'};
        } else if (content.includes('close')) {
            return {color: 'red'};
        }
        return {};
    }

    readonly columns = [
        {
            id: "treatment",
            Header: <span><b>Drug(s)</b></span>,
            accessor: "treatment",
            maxWidth: 200,
            style: { display: "flex", justifyContent: "center", alignItems: "center" },
            Cell: (props: {original: IMatchedTrials}) =>
                <div style={{whiteSpace: "normal", lineHeight: '1rem'}}>
                    {props.original.treatment}
                </div>
        },
        {
            id: "trials",
            Header: <span><b>Trials</b><button style={{float: 'right', backgroundColor: '#1c75cd', color: '#fff'}}>Display All</button></span>,
            accessor: "trials",
            Cell: (props: {original: IMatchedTrials}) => (
                <div>
                    { props.original.trials.map((trial: ITrial) =>
                        <div style={{marginBottom: 5}}>
                            <a style={{marginRight: 5}}
                                className={styles["list-group-item-title"]}
                                href={`https://clinicaltrials.gov/ct2/show/${trial.nctId}`}
                                target="_blank"
                            >
                                {trial.nctId}
                            </a>
                            <span>
                                <span style={this.getContentColor(trial.currentTrialStatus)}>{trial.currentTrialStatus}</span>
                                {':'}
                            </span>
                            <span style={{marginLeft: 5, lineHeight: '1rem'}}>{trial.briefTitle.length > 36 ? trial.briefTitle.substring(0, 36) + '...' : trial.briefTitle}</span>
                        </div>
                    )}
                </div>
            )
        }
    ];

    public render() {
        return (
            <div className="oncokb-treatment-table">
                <ReactTable
                    data={this.props.trials}
                    columns={this.columns}
                    showPagination={false}
                    pageSize={this.props.trials.length}
                    className="-striped -highlight"
                />
            </div>
        );
    }
}

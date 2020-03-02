import {observer} from "mobx-react";
import * as React from 'react';
import ReactTable from "react-table";
import {defaultSortMethod} from "../../util/ReactTableUtils";
import "./oncoKbTreatmentTable.scss";
import { ITrial } from "../../model/NcitTrial";
import styles from './listGroupItem.module.scss';

type TrialsTableProps = {
    trials: ITrial[];
};


@observer
export default class TrialsTable extends React.Component<TrialsTableProps> {

    getContentColor(content: string) {
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
            id: "nctId",
            Header: <span><b>ID</b></span>,
            accessor: "nctId",
            maxWidth: 100,
            style: {textAlign: "center" },
            sortMethod: (a: string, b: string) => defaultSortMethod(a, b),
            Cell: (props: {original: ITrial}) =>
                <div style={{whiteSpace: "normal", lineHeight: '1rem'}}>
                    <a
                        className={styles["list-group-item-title"]}
                        href={`https://clinicaltrials.gov/ct2/show/${props.original.nctId}`}
                        target="_blank"
                    >
                    {props.original.nctId}
                    </a>
                    <br/>
                    <span style={this.getContentColor(props.original.currentTrialStatus)}>{props.original.currentTrialStatus}</span>
                </div>

        },
        // {
        //     id: "currentTrialStatus",
        //     Header: <span><b>Status</b></span>,
        //     accessor: "currentTrialStatus",
        //     maxWidth: 80,
        //     style: {textAlign: "center" },
        //     sortMethod: (a: string, b: string) => defaultSortMethod(a, b),
        //     Cell: (props: {value: string}) =>
        //         <div style={{whiteSpace: "normal", lineHeight: '1rem'}}>
        //             <span style={this.getContentColor(props.value)}>{props.value}</span>
        //         </div>
        //
        // },
        {
            id: "briefTitle",
            Header: <span><b>Title</b></span>,
            accessor: "briefTitle",
            Cell: (props: {value: string}) =>
                <div style={{whiteSpace: "normal", lineHeight: '1rem'}}>
                    {props.value}
                </div>
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

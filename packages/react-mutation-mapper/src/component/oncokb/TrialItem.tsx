import * as React from 'react';

import styles from './listGroupItem.module.scss';

type TrialItemProps = {
    title: string;
    author?: string;
    status: string;
    isUSTrial?: boolean;
    nctId: string;
};

export default class TrialItem extends React.Component<TrialItemProps> {

    getContentColor(content: string) {
        content = content.toLowerCase();
        if (content.includes('open') || content.includes('active')) {
            return {color: 'green'};
        } else if (content.includes('close')) {
            return {color: 'red'};
        }
        return {};
    }
    render() {
        return (
            <li key={this.props.nctId} className={styles["list-group-item"]}>
                <span>
                    <a
                        className={styles["list-group-item-title"]}
                        href={`https://clinicaltrials.gov/ct2/show/${this.props.nctId}`}
                        target="_blank"
                    >
                        <b>{this.props.nctId}</b>
                    </a>
                    : {this.props.title}
                </span>
                <div className={styles["list-group-item-content"]}>
                    <span style={this.getContentColor(this.props.status)}>{this.props.status}</span>
                </div>
            </li>
        );
    }
}

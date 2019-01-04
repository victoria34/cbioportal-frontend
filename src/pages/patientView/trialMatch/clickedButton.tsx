import * as React from 'react';
import { If, Then, Else } from 'react-if';
import styles from './style/trialMatch.module.scss';
import { ICriteria } from "../../../shared/model/MatchMiner";

export interface IClickedButtonProps {
    buttonName: string;
    className?: string;
    listName?: string;
    listContent: Array<ICriteria>;
}

export default class ClickedButton extends React.Component<IClickedButtonProps, {}> {

    constructor(props: IClickedButtonProps) {
        super(props);

        this.state = { clicked: false };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState({ clicked: !this.state.clicked });
    }

    render() {
        const results = this.props.listContent.map(function(ele: any){
            return (
                <li>{ele.description}</li>
            )});

        return (
            <div className={styles.buttonDiv}>
                <button className={this.props.className} onClick={this.handleClick}>
                    {this.props.buttonName}
                </button>
                <If condition={this.state.clicked}>
                    <ul className={styles.diseasesUl}>
                        {results}
                    </ul>
                </If>
            </div>
        )
    }
}

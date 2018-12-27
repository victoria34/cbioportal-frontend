import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import { ITrial, ITrialMatch } from "../../../shared/model/MatchMiner";

export type IMatchMinerProps = {
    trialMatches:Array<ITrialMatch>;
    trials:Array<ITrial>;
}

@observer
export default class MatchMiner extends React.Component<IMatchMinerProps> {

    constructor(props: IMatchMinerProps){

        super();

        this.state = {};

        // this.handleSelection = this.handleSelection.bind(this);

        // this.styles = {
        //     container: {
        //         lineHeight: 1.5,
        //         width: `auto`,
        //         backgroundColor: `#fff`,
        //         paddingTop: 10,
        //         paddingBottom: 10,
        //         margin: 20,
        //         boxShadow:`0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)`
        //     },
        //     row: {
        //         marginLeft: 0,
        //         marginRight: 0
        //     },
        //     colMd6: {
        //         minHeight: 1,
        //         paddingRight: 15,
        //         paddingLeft: 15
        //     },
        //     span: {
        //         marginRight: 10
        //     },
        //     notFoundText: {
        //         display: `block`,
        //         textAlign: `center`,
        //         margin: 20
        //     }
        //
        // };

    }

    shouldComponentUpdate(nextProps: IMatchMinerProps){
        return nextProps === this.props;
    }

    // handleSelection(){
    //     this.setState({ pdfUrl:this.buildPDFUrl(this.pdfSelectList.options[this.pdfSelectList.selectedIndex].value) });
    // }

    render(){

        return (
            <div style={{minHeight: 400}}>
                <div>
                    {this.props.trialMatches.map(function(d, idx){
                        return (
                            <div className="container" key={idx}>
                                <div className="row">
                                    <div className="col-md-12">
                                        <a href="">{d.nctId}</a>
                                        {/*- {d.shortTitle}*/}
                                    </div>
                                </div>
                                {/*<div className="row" style={styles.row}>*/}
                                    {/*<div className="col-md-12">*/}
                                        {/*<span style={styles.span}>Long Title:</span>*/}
                                        {/*<span>{d.longTitle}</span>*/}
                                    {/*</div>*/}
                                {/*</div>*/}
                                <div className="row">
                                    <div className="col-md-3">
                                        <span>Vital Status:</span>
                                        <span>{d.vitalStatus}</span>
                                    </div>
                                    <div className="col-md-3">
                                        <span>Trial Accrual Status:</span>
                                        <span>{d.trialAccrualStatus}</span>
                                    </div>
                                    <div className="col-md-3">
                                        <span>Patient Genomic:</span>
                                        <span>{d.trueHugoSymbol} - {d.trueProteinChange}</span>
                                    </div>
                                    <div className="col-md-3">
                                        <span>Trial Genomic:</span>
                                        <span>{d.genomicAlteration}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }
}

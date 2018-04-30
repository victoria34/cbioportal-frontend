import * as React from "react";
import {If, Then, Else} from 'react-if';
import { MatchTrialResult } from "../../../shared/api/generated/MatchminerCurationAPI";

export interface ITrialMatchListProps {
    matchTrialResult: MatchTrialResult;
}
export default class TrialMatchList extends React.Component<ITrialMatchListProps>{

    public render() {
        const styles = {
            container: {
                lineHeight: 1.5,
                width: `auto`,
                backgroundColor: `#fff`,
                paddingTop: 10,
                paddingBottom: 10,
                margin: 20,
                boxShadow:`0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)`
            },
            row: {
               marginLeft: 0,
               marginRight: 0
            },
            colMd6: {
                minHeight: 1,
                paddingRight: 15,
                paddingLeft: 15
            },
            span: {
                marginRight: 10
            },
            notFoundText: {
                display: `block`,
                textAlign: `center`,
                margin: 20
            }

        };
        const data = this.props.matchTrialResult.trials;

        return (
            <div style={{minHeight: 400}}>
                {data.length > 0  ? (
                    <div>
                        {data.map(function(d, idx){
                        return (
                            <div className="container" key={idx} style={styles.container}>
                                <div className="row" style={styles.row}>
                                    <div className="col-md-12">
                                        <a href="https://matchminer-match.herokuapp.com">{d.nctId}</a> - {d.shortTitle}
                                    </div>
                                </div>
                                <div className="row" style={styles.row}>
                                    <div className="col-md-12">
                                        <span style={styles.span}>Long Title:</span>
                                        <span>{d.longTitle}</span>
                                    </div>
                                </div>
                                <div className="row" style={styles.row}>
                                    <div className="col-md-6" style={styles.colMd6}>
                                        <span style={styles.span}>Phase:</span>
                                        <span>{d.phase}</span>
                                    </div>
                                    <div className="col-md-6" style={styles.colMd6}>
                                        <span style={styles.span}>Status:</span>
                                        <span>{d.status}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    </div>
                ): (
                    <span style={styles.notFoundText}><b>Sorry, no trial is matched for this patient!</b></span>
                )}
            </div>
        );
    }
}

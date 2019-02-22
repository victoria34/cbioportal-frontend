import * as React from 'react';
import { If, Then, Else } from 'react-if';
import * as _ from 'lodash';
import {observer} from "mobx-react";
import { IDiscreteTrialMatch, IDisplayMatch, INctTrial, ITrial, ITrialMatch } from "../../../shared/model/MatchMiner";
import styles from './style/trialMatch.module.scss';
import { computed } from "mobx";
import LazyMobXTable from "../../../shared/components/lazyMobXTable/LazyMobXTable";
import SampleManager from "../sampleManager";

export type ITrialMatchProps = {
    sampleManager?: SampleManager | null;
    trials: Array<ITrial>;
    trialMatches:Array<ITrialMatch>;
    nctTrials:Array<INctTrial>;
    containerWidth: number;
}

export type ITrialMatchState = {
    detailedTrialMatches: Array<IDiscreteTrialMatch>;
}

enum ColumnKey {
    ID = 'ID',
    TITLE = 'Title',
    INTERVENTIONS = 'Interventions',
    MATCHINGCRITERIA = 'Matching Criteria'
}

class TrialMatchTableComponent extends LazyMobXTable<IDiscreteTrialMatch> {

}

@observer
export default class TrialMatchTable extends React.Component<ITrialMatchProps, ITrialMatchState> {

    constructor(props: ITrialMatchProps) {
        super(props);
        this.state = { detailedTrialMatches: this.buildDetailedTrialMatches(props.trialMatches, props.trials, props.nctTrials) };
    }

    @computed
    get columnsWidth() {
        return {
            [ColumnKey.ID]: 0.1 * this.props.containerWidth,
            [ColumnKey.TITLE]: 0.24 * this.props.containerWidth,
            [ColumnKey.INTERVENTIONS]: 0.16 * this.props.containerWidth,
            [ColumnKey.MATCHINGCRITERIA]: 0.5 * this.props.containerWidth
        };
    }

    private _columns = [{
        name: ColumnKey.ID,
        render: (trial: IDiscreteTrialMatch) => (
            <div>
                <span><a target="_blank" href={"https://www.mskcc.org/cancer-care/clinical-trials/" + trial.protocolNo}>{trial.protocolNo}</a></span><br/>
                <span><a target="_blank" href={"https://clinicaltrials.gov/ct2/show/" + trial.nctId}>{trial.nctId}</a></span><br/>
                <span>{trial.status}</span>
            </div>
        ),
        width: this.columnsWidth[ColumnKey.ID]
    }, {
        name: ColumnKey.TITLE,
        render: (trial: IDiscreteTrialMatch) => (
                <span>{trial.shortTitle}</span>
        ),
        width: this.columnsWidth[ColumnKey.TITLE]
    }, {
        name: ColumnKey.MATCHINGCRITERIA,
        render: (trial: IDiscreteTrialMatch) => {
            const props = this.props;
            const lastIndex = trial.matches.length - 1;
            return (
                <div>
                    {trial.matches.map((match: any, index:number) => (
                            <If condition={match.genomicAlteration.includes('!')}>
                                <Then>
                                    <div className={styles.criteriaContainer}>
                                        <span className={styles.genomicSpan + styles.firstLeft}><b>Not </b>{match.genomicAlteration.replace(/!/g, '',) + ' '}
                                            {match.sampleIds.map((sampleId: string) => (
                                                <span className={styles.genomicSpan}>
                                                    {props.sampleManager!.getComponentForSample(sampleId, 1, '')}
                                                </span>
                                            ))}
                                        </span>
                                        <span className={styles.firstRight}>
                                             <span className={styles.secondLeft}>{match.trialAgeNumerical}</span>
                                            <span className={styles.secondRight}>{match.trialOncotreePrimaryDiagnosis}</span>
                                        </span>
                                    </div>
                                    <If condition={index < lastIndex}><hr className={styles.criteriaHr}/></If>
                                </Then>
                                <Else>
                                    <div className={styles.criteriaContainer}>
                                        <span className={styles.genomicSpan + styles.firstLeft}>
                                            {match.genomicAlteration + ' ( ' + match.trueHugoSymbol + ' ' + match.trueProteinChange + ' '}
                                            {match.sampleIds.map((sampleId: string) => (
                                                <span className={styles.genomicSpan}>
                                                    {props.sampleManager!.getComponentForSample(sampleId, 1, '')}
                                                </span>
                                            ))}
                                            {')'}
                                        </span>
                                        <span className={styles.firstRight}>
                                             <span className={styles.secondLeft}>{match.trialAgeNumerical}</span>
                                            <span className={styles.secondRight}>{match.trialOncotreePrimaryDiagnosis}</span>
                                        </span>
                                    </div>
                                    <If condition={index < lastIndex}><hr className={styles.criteriaHr}/></If>
                                </Else>
                            </If>
                    ))}
                </div>
            )
        },
        width: this.columnsWidth[ColumnKey.MATCHINGCRITERIA]
    }, {
        name: ColumnKey.INTERVENTIONS,
        render: (trial: IDiscreteTrialMatch) => (
                <ul className={styles.diseasesUl}>
                    {trial.interventions.map((intervention: any) => (
                        <li>{intervention}</li>
                    ))}
                </ul>
        ),
        width: this.columnsWidth[ColumnKey.INTERVENTIONS]
    }];

    buildDetailedTrialMatches(matches: Array<ITrialMatch>, trials: Array<ITrial>, nctTrials: Array<INctTrial>) {
        const groupedMatches = _.groupBy(matches, 'nctId');
        let matchedTrials: Array<IDiscreteTrialMatch> = [];
        const trialIds = Object.keys(groupedMatches);
        _.forEach(trialIds, function (key) {
            let matchedTrial:any = {};
            _.some(trials, function(trial) {
                if (key === trial['nctId']) {
                    matchedTrial = trial;
                    return true;
                }
            });

            const groupByGenomicAlteration = _.groupBy(groupedMatches[key], 'genomicAlteration');
            const gaKeys = Object.keys(groupByGenomicAlteration).sort((a,b) => {
                if (a.includes('!')) {
                    if (b.includes('!')) { // a and b contain '!'
                        return a.length - b.length || a.slice(1).localeCompare(b.slice(1));
                    } else { // only a contains '!'
                        return 1;
                    }
                } else {
                    if (b.includes('!')) { // only b contains '!'
                        return -1;
                    } else { // a and b don't contain '!'
                        return a.length - b.length || a.localeCompare(b);
                    }
                }
            });
            let displayMatches: Array<IDisplayMatch> = [];
            _.forEach(gaKeys, function(gaKey) {
                let displayMatch: IDisplayMatch = {
                    trueHugoSymbol: '',
                    trueProteinChange: '',
                    genomicAlteration: '',
                    trialAgeNumerical: '',
                    trialOncotreePrimaryDiagnosis: '',
                    sampleIds: []
                };

                displayMatch.genomicAlteration = gaKey;
                displayMatch.trueHugoSymbol = groupByGenomicAlteration[gaKey][0].trueHugoSymbol;
                displayMatch.trueProteinChange = groupByGenomicAlteration[gaKey][0].trueProteinChange;
                displayMatch.trialAgeNumerical = groupByGenomicAlteration[gaKey][0].trialAgeNumerical;
                displayMatch.trialOncotreePrimaryDiagnosis = groupByGenomicAlteration[gaKey][0].trialOncotreePrimaryDiagnosis;
                const sampleIds = _.map(groupByGenomicAlteration[gaKey], 'sampleId');
                displayMatch.sampleIds = _.uniq(sampleIds).sort();
                displayMatches.push(displayMatch);
            });
            matchedTrial['matches'] = displayMatches;

            _.some(nctTrials, function(trial) {
                if (key === trial['nctId']) {
                    matchedTrial['interventions'] = trial['interventions'];
                    return true;
                }
            });

            matchedTrials.push(matchedTrial);
        });
        return matchedTrials;
    }

    render() {
        return (
            <TrialMatchTableComponent
                data={this.state.detailedTrialMatches}
                columns={this._columns}
            />
        )
    }
}

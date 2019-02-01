import * as request from 'superagent';
import * as _ from 'lodash';
import { INctTrial, ITrial, ITrialMatch } from "shared/model/MatchMiner.ts";

/**
 * Retrieves the trial matches for the query given, if they are in the MatchMiner API.
 */


export async function postMatchMinerTrialMatches(query: object): Promise<Array<ITrialMatch>> {
    return request.post('/proxy/matchminer/api/query_trial_match')
    .send(query)
    .then((res) => {
        let response = JSON.parse(res.text);
        return response.map((record:any) => ({
            nctId: record.nct_id,
            oncotreePrimaryDiagnosisName: record.oncotree_primary_diagnosis_name,
            matchType: record.match_type,
            trueHugoSymbol: record.true_hugo_symbol,
            trialAccrualStatus: record.trial_accrual_status,
            matchLevel: record.match_level,
            sampleId: record.sample_id,
            mrn: record.mrn,
            trueProteinChange: record.true_protein_change,
            vitalStatus: record.vital_status,
            genomicAlteration: record.genomic_alteration
        }));
    });
}

export async function getMatchMinerTrial(nctId: string): Promise<ITrial> {
    return request.get('/proxy/matchminer/api/query_trial/'+ nctId)
    .then((res) => {
        let response = JSON.parse(res.text);
        return {
            nctId: response.nct_id,
            protocolNo: response.protocol_no,
            phase: response.phase,
            shortTitle: response.short_title,
            status: response.status,
            treatmentList: response.treatment_list
        };
    });
}

export async function getNctTrial(nctId: string): Promise<INctTrial> {
    return request.get('https://clinicaltrialsapi.cancer.gov/v1/clinical-trial/'+ nctId)
    .then((res) => {
        let response = JSON.parse(res.text);
        let interventions: Array<string> = [];
        _.forEach(response.arms, function(arm) {
            if (arm.interventions) {
                _.forEach(arm.interventions, function(intervention) {
                    if (intervention.inclusion_indicator === 'TRIAL') {
                        interventions.push(intervention.intervention_type + ': ' + intervention.intervention_name);
                    }
                });
            }
        });
        return {
            nctId: response.nct_id,
            interventions: _.uniq(interventions).sort()
        };
    });
}
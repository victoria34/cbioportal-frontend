import * as request from 'superagent';
import * as _ from 'lodash';
import { INctTrial, ITrial, ITrialMatch } from "shared/model/MatchMiner.ts";

/**
 * Retrieves the trial matches for the query given, if they are in the MatchMiner API.
 */
const awsUrl = 'http://ec2-3-80-162-201.compute-1.amazonaws.com:5555';
export async function postMatchMinerTrialMatches(query: object): Promise<Array<ITrialMatch>> {
    return request.post(awsUrl + '/api/query_trial_match')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Basic ZmI0ZDY4MzAtZDNhYS00ODFiLWJjZDYtMjcwZDY5NzkwZTExOg==')
    .send(query)
    .then((res) => {
        let response = JSON.parse(res.text);
        console.log("result:", response);
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
    return request.get(awsUrl + '/api/query_trial/'+ nctId)
    .set('Authorization', 'Basic ZmI0ZDY4MzAtZDNhYS00ODFiLWJjZDYtMjcwZDY5NzkwZTExOg==')
    .then((res) => {
        let response = JSON.parse(res.text);
        return {
            nctId: response.nct_id,
            longTitle: response.long_title,
            phase: response.phase,
            shortTitle: response.short_title,
            status: response.status
        };
    });
}

export async function getNctTrial(nctId: string): Promise<INctTrial> {
    return request.get('https://clinicaltrialsapi.cancer.gov/v1/clinical-trial/'+ nctId)
    .then((res) => {
        let response = JSON.parse(res.text);
        let diseases: Array<string> = [];
        let interventions: Array<string> = [];
        _.forEach(response.diseases, function(disease) {
            if (disease.inclusion_indicator === 'TRIAL') {
                diseases.push( disease.display_name );
            }
        });
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
            diseases: _.uniq(diseases).sort(),
            interventions: _.uniq(interventions).sort(),
            eligibility: response.eligibility
        };
    });
}

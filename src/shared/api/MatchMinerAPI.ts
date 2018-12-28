import * as request from 'superagent';
import { ITrial, ITrialMatch } from "shared/model/MatchMiner.ts";

/**
 * Retrieves the trial matches for the query given, if they are in the MatchMiner API.
 */
const awsUrl = 'http://ec2-100-26-147-224.compute-1.amazonaws.com:5555';
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

/**
 * Returns a promise that resolves with the variants for the parameters given.
 */
export async function postMatchMinerTrial(query: object): Promise<Array<ITrial>> {
    return request.post(awsUrl + '/api/query_trial/')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Basic ZmI0ZDY4MzAtZDNhYS00ODFiLWJjZDYtMjcwZDY5NzkwZTExOg==')
    .send(query)
    .then((res) => {
        let response = JSON.parse(res.text);
        return response.map((record:any) => ({
            longTitle: record.long_title,
            nctId: record.nct_id,
            phase: record.phase,
            shortTitle: record.short_title,
            status: record.status
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

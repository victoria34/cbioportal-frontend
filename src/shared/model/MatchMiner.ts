export interface ITrial {
    nctId: string;
    protocolNo: string | null;
    phase: string;
    shortTitle: string;
    status: string;
    treatmentList: string;
}

export interface ITrialMatch {
    nctId: string;
    oncotreePrimaryDiagnosisName: string;
    gender: string | null;
    matchType: string;
    trueHugoSymbol: string | null;
    trialAccrualStatus: string;
    matchLevel: string;
    sampleId: string;
    mrn: string;
    trueProteinChange: string | null;
    vitalStatus: string | null;
    genomicAlteration: string;
    trialAgeNumerical: string | null;
    trialOncotreePrimaryDiagnosis: string| null;
}

export interface IDisplayMatch {
    trueHugoSymbol: string | null;
    trueProteinChange: string | null;
    genomicAlteration: string;
    trialAgeNumerical: string | null;
    trialOncotreePrimaryDiagnosis: string| null;
    sampleIds: Array<string>;
}

export interface INctTrial {
    nctId: string;
    interventions: Array<string>;
}

export interface IDiscreteTrialMatch {
    nctId: string;
    protocolNo: string | null;
    phase: string;
    shortTitle: string;
    status: string;
    interventions: Array<string>;
    matches: Array<IDisplayMatch>;
}

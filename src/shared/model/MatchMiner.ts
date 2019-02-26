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
    clinicalInfo: string | null;
    trialAgeNumerical: string | null;
    trialOncotreePrimaryDiagnosis: string| null;
}

export interface IGenomicMatch {
    trueHugoSymbol: string | null;
    trueProteinChange: string | null;
    genomicAlteration: string;
    sampleIds: Array<string>;
}

export interface IClinicalGroupMatch {
    trialAgeNumerical: string | null;
    trialOncotreePrimaryDiagnosis: string| null;
    matches: Array<IGenomicMatch>;
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
    matches: Array<IClinicalGroupMatch>;
}

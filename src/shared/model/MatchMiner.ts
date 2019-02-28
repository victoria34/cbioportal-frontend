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
    armDescription: string | null;
    trueHugoSymbol: string | null;
    trialAccrualStatus: string;
    matchLevel: string;
    sampleId: string;
    mrn: string;
    trueProteinChange: string | null;
    vitalStatus: string | null;
    genomicAlteration: string;
    patientClinical: string | null;
    patientGenomic: string | null;
    trialAgeNumerical: string | null;
    trialOncotreePrimaryDiagnosis: string| null;
}

export interface IGenomicMatch {
    trueHugoSymbol: string | null;
    trueProteinChange: string | null;
    sampleIds: Array<string>;
}

export interface IClinicalGroupMatch {
    trialAgeNumerical: string | null;
    trialOncotreePrimaryDiagnosis: string| null;
    matches: Array<IGenomicGroupMatch>;
    notMatches: Array<IGenomicGroupMatch>;
}
export interface IGenomicGroupMatch {
    genomicAlteration: string;
    matches: Array<IGenomicMatch>;
}

export interface INctTrial {
    nctId: string;
    interventions: Array<string>;
}

export interface IDetailedTrialMatch {
    nctId: string;
    protocolNo: string | null;
    phase: string;
    shortTitle: string;
    status: string;
    interventions: Array<string>;
    armDescription: string | null;
    matches: Array<IClinicalGroupMatch>;
}

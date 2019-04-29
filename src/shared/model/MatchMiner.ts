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
    trialAgeNumerical: string;
    trialOncotreePrimaryDiagnosis: string;
}

export interface IGenomicMatch {
    trueHugoSymbol: string | null;
    trueProteinChange: string | null;
    sampleIds: Array<string>;
}

export interface ICancerTypeMatch {
    general: Array<string>;
    not: Array<string>;
}

export interface IGenomicTypeMatch {
    genomicAlteration: string;
    matches: Array<IGenomicMatch>;
    type: string;
}

export interface INctTrial {
    nctId: string;
    interventions: Array<string>;
}

export interface IFlattenTrialMatch {
    nctId: string;
    protocolNo: string;
    shortTitle: string;
    status: string;
    armDescriptions: Array<string>;
    genomics: Array<IGenomicTypeMatch | any>;
    ages: Array<string>;
    cancerTypes: Array<ICancerTypeMatch>;
    interventions: Array<Array<string>>;
    priority: number;
}

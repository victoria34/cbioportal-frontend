export interface ITrial {
    longTitle: string;
    nctId: string;
    phase: string;
    shortTitle: string;
    status: string;
}

export interface ITrialMatch {
    nctId: string;
    oncotreePrimaryDiagnosisName: string;
    matchType: string;
    trueHugoSymbol: string | null;
    trialAccrualStatus: string;
    matchLevel: string;
    sampleId: string;
    mrn: string;
    trueProteinChange: string | null;
    vitalStatus: string;
    genomicAlteration: string;
}

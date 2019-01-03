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
    vitalStatus: string | null;
    genomicAlteration: string;
}

export interface INctTrial{
    nctId: string;
    diseases: Array<string>;
    interventions: Array<string>;
}

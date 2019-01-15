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

export interface INctTrial {
    nctId: string;
    interventions: Array<string>;
}

export interface ICriteria {
    display_order: number;
    inclusion_indicator: boolean;
    description: string;
}

export interface IDiscreteTrialMatch {
    nctId: string;
    protocolNo: string | null;
    phase: string;
    shortTitle: string;
    status: string;
    age: string | null;
    gender: string | null;
    diseases: Array<string>;
    interventions: Array<string>;
    matches: Array<ITrialMatch>;
}

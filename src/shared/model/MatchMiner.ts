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
    eligibility: {
        structured: {
            gender: string;
            max_age: string;
            max_age_number: number;
            max_age_unit: string;
            min_age: string;
            min_age_number: number;
            min_age_unit: string;
            max_age_in_years: number;
            min_age_in_years: number;
        };
        unstructured: Array<ICriteria>;
    };
}

export interface IEligibility {
    clinical: {
        age: string;
        sex: string;
    };
    genomic: {
        inclusion: Array<ICriteria>;
        exclusion: Array<ICriteria>;
    };
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
    eligibility: IEligibility;
    matches: Array<ITrialMatch>;
}

export interface ITrialsByDrug {
    [drugName: string]: ITrial[];
}

export type ITrial = {
    briefTitle: string;
    currentTrialStatus: string;
    principalInvestigator: string;
    drugs: IDrug[];
    isUSTrial: boolean;
    nctId: string;
};

export type IDrug = {
    ncitCode: string;
    drugName: string;
};



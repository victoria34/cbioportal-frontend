export interface ITrialsByDrug {
    [drugName: string]: ITrial[];
}

export type ITrial = {
    briefTitle: string;
    currentTrialStatus: string;
    drugs: IDrug[];
    nctId: string;
};

export type IDrug = {
    ncitCode: string;
    drugName: string;
};

// export type INcitTrial = {
//     title: string;
//     status: string;
//     nctId: string;
//     author?: string;
//     isUSTrial?: boolean;
// };

export type IMatchedTrials = {
    treatment: string;
    trials: ITrial[];
};


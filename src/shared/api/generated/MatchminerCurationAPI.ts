import * as request from "superagent";

type CallbackHandler = (err: any, res ? : request.Response) => void;
export type Clinical = {
    'birthDate': string

        'firstLast': string

        'gender': string

        'mrn': number

        'oncotreePrimaryDiagnosisName': string

        'ordPhysicianEmail': string

        'ordPhysicianName': string

        'reportDate': string

        'sampleId': string

        'vitalStatus': string

};
export type Genomic = {
    'alleleFraction': number

        'canonicalStand': string

        'chromosome': string

        'cnvCall': string

        'position': string

        'referenceAllele': string

        'sampleId': string

        'tier': number

        'trueCdnaChange': string

        'trueHugoSymbol': string

        'trueProteinChange': string

        'trueTranscriptExon': number

        'trueVariantClassification': string

        'variantCategory': string

        'wildtype': boolean

};
export type MatchTrialResult = {
    'id': string

        'trials': Array < Trial >

};
export type Patient = {
    'clinical': Clinical

        'genomics': Array < Genomic >

        'id': string

};
export type Trial = {
    'longTitle': string

        'nctId': string

        'phase': string

        'shortTitle': string

        'status': string

        'treatmentList': string

};
export type TrialJson = {
    'trial': {}

};

/**
 * matchminerCurate API documentation
 * @class MatchminerCurationAPI
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export default class MatchminerCurationAPI {

    private domain: string = "";
    private errorHandlers: CallbackHandler[] = [];

    constructor(domain ? : string) {
        if (domain) {
            this.domain = domain;
        }
    }

    getDomain() {
        return this.domain;
    }

    addErrorHandler(handler: CallbackHandler) {
        this.errorHandlers.push(handler);
    }

    private request(method: string, url: string, body: any, headers: any, queryParameters: any, form: any, reject: CallbackHandler, resolve: CallbackHandler, errorHandlers: CallbackHandler[]) {
        let req = (new(request as any).Request(method, url) as request.Request)
            .query(queryParameters);
        Object.keys(headers).forEach(key => {
            req.set(key, headers[key]);
        });

        if (body) {
            req.send(body);
        }

        if (typeof(body) === 'object' && !(body.constructor.name === 'Buffer')) {
            req.set('Content-Type', 'application/json');
        }

        if (Object.keys(form).length > 0) {
            req.type('form');
            req.send(form);
        }

        req.end((error, response) => {
            if (error || !response.ok) {
                reject(error);
                errorHandlers.forEach(handler => handler(error));
            } else {
                resolve(response);
            }
        });
    }

    loadTrialUsingPOSTURL(parameters: {
        'body': TrialJson,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/trials/create';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Load trial data into Mongo DB.
     * @method
     * @name MatchminerCurationAPI#loadTrialUsingPOST
     * @param {} body - A trial json object.
     */
    loadTrialUsingPOST(parameters: {
        'body': TrialJson,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < any > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/trials/create';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = '*/*';
            headers['Content-Type'] = 'application/json';

            if (parameters['body'] !== undefined) {
                body = parameters['body'];
            }

            if (parameters['body'] === undefined) {
                reject(new Error('Missing required  parameter: body'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        }).then(function(response: request.Response) {
            return response.body;
        });
    };

    matchTrialUsingPOSTURL(parameters: {
        'body': Patient,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/trials/match';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Match trial in Mongo DB to patient
     * @method
     * @name MatchminerCurationAPI#matchTrialUsingPOST
     * @param {} body - Clinical and genomic data of a patient.
     */
    matchTrialUsingPOST(parameters: {
        'body': Patient,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < MatchTrialResult > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/trials/match';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['body'] !== undefined) {
                body = parameters['body'];
            }

            if (parameters['body'] === undefined) {
                reject(new Error('Missing required  parameter: body'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        }).then(function(response: request.Response) {
            return response.body;
        });
    };

}

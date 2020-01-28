import {action, observable} from "mobx";
import request from "superagent";

import {MobxCache} from "../model/MobxCache";
import { ITrial } from "../model/NcitTrial";

export type TrialsRecords = {
    [cancerType: string]: ITrial[];
}

export class DefaultTrialsCache implements MobxCache<TrialsRecords, string>
{
    protected _cache = observable.shallowMap();

    public async fetch(query: string)
    {
        const trialsRecords = await new Promise<TrialsRecords>((resolve, reject) => {
            // const url = 'https://cbioportal.mskcc.org/proxy/localhost:2333/trials';
            const url = 'http://localhost:2333/trials';
            request.post(url)
                .set('Content-Type', 'application/json')
                .send({cancerType: query})
                .end((err, res)=>{
                    if (!err && res.ok) {
                        const response = JSON.parse(res.text);
                        let ret: TrialsRecords = {};
                        ret[query] = response;
                        resolve(ret);
                    } else {
                        reject(err);
                    }
                });
        });

        return trialsRecords[query];
    }

    @action
    public get(query: string)
    {
        if (!this._cache[query]) {
            this._cache[query] = {status: "pending"};

            this.fetch(query)
            .then(d => this._cache[query] = {status: "complete", data: d})
            .catch(() => this._cache[query] = {status: "error"});
        }

        return this._cache[query];
    }

    public get cache() {
        // TODO "as any" is not ideal
        return this._cache as any;
    }
}

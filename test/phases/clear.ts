import { Api, JsonRpc, JsSignatureProvider } from "@proton/js"
import * as fs from "fs";



export interface ICleaConfig {

    authorizations: any[];
    logPath:string;


}

export class Clear {


    public result: any;
    public actions: any;
    private api: Api;

    constructor(
        public config: ICleaConfig
    ) {}

    generateAction(account: string): any {

        this.actions = {
            account: 'snipstake',
            name: 'admin.clear',
            authorization: this.config.authorizations,
            data: {
                account: account
            }
        }

        return this.actions
    }

}



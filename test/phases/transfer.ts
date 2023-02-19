

import { Api, JsonRpc, JsSignatureProvider } from "@proton/js"
import * as fs from "fs";
import { toPrecision } from "../utils/Asset";


export interface ITransferConfig {

    from: string;
    to: string;
    authorizations: any[];
    totalAmount: number;
    logPath: string;


}

export class Transfer {


    public result: any;
    public actions: any;
    private api: Api;

    constructor(
        public config: ITransferConfig
    ) { }




    generateAction(from: string, to: string, quantity: string, memo: string): any {

        console.log(quantity)
        this.actions = {
            account: 'snipx',
            name: 'transfer',
            authorization: this.config.authorizations,
            data: {
                from: from,
                to: to,
                quantity: quantity,
                memo: memo
            }
        }

        return this.actions


    }

    saveLog() {

        fs.writeFileSync(this.config.logPath, '')
        fs.writeFileSync(this.config.logPath, JSON.stringify(this.actions, null, 2))


    }

}




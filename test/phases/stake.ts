import { Api, JsonRpc, JsSignatureProvider } from "@proton/js"
import * as fs from "fs";
import { toPrecision } from "../utils/Asset";


export interface IStakeConfig {

    from: string;
    to: string;
    authorizations: any[];
    totalAmount: number;
    actionsCount: number;
    logPath:string;


}

export class Stake {


    public result: any;
    public actions: any;
    private api: Api;

    constructor(
        public config: IStakeConfig
    ) {}


    generateStakeActions(): any[] {

        const now = new Date();
        now.setDate(now.getDay()-30);
        const amounts = this.distributeAmount(this.config.totalAmount, this.config.actionsCount);
        this.actions = amounts.map((amount) => this.generateStakeAction(this.config.from, this.config.to, `${toPrecision(amount,4)} SNIPX`, now.getTime().toString()))
        return this.actions;


    }

    generateStakeAction(from: string, to: string, quantity: string, memo: string): any {

        console.log(quantity)
        return {
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


    }
    
    generateUnstakeAction(account: string, amount:number): any {

        return {
            account: 'snipstake',
            name: 'stake.unstk',
            authorization: this.config.authorizations,
            data: {
                account: account,
                amount: amount   
            }
        }


    }

    saveLog (){

        fs.writeFileSync(this.config.logPath,'')
        fs.writeFileSync(this.config.logPath,JSON.stringify(this.actions,null,2))


    }

    private distributeAmount(amount: number, share: number): number[] {


        const rem = amount % share;
        const val = Math.floor(amount / share);
        return Array.from({ length: share }, (_, i) => (!i ? (val + rem) : val));


    }

}



import { Api, JsonRpc, JsSignatureProvider } from "@proton/js";
import * as fs from "fs";

const STAKING_DURATION_DAY: i64 = 1000 * 60 * 60 * 24;

const EPS = [
  "https://testnet.brotonbp.com",
  "https://api-protontest.saltant.io",
  "https://api.testnet.protongb.com",
  "https://testnet-api.protongroup.info",
  "https://test.proton.kiwi",
  "https://bptestnet.xprasia.com",
];

export interface IUnstakeConfig {

  account: string;
  authorizations: any[];
  logPath: string;

}

export class Unstake {

  public action: any;
  constructor(private config: IUnstakeConfig) { }

  generateUnstakeUpdateAction(account: string): any {

    this.action = {
      account: 'snipstake',
      name: 'stake.update',
      authorization: this.config.authorizations,
      data: {
        account: account,

      }
    }

    return this.action
  }

  generateUnstakeAction(account: string, amount:number): any {

    this.action = {
      account: 'snipstake',
      name: 'stake.unstk',
      authorization: this.config.authorizations,
      data: {
        account: account,
        quantity:`${amount} SNIPX`
      }
    }

    return this.action
  }

  saveLog() {

    fs.writeFileSync(this.config.logPath, '');
    fs.writeFileSync(this.config.logPath, JSON.stringify(this.action, null, 2));

  }

}


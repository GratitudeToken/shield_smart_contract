import { Api, JsonRpc, JsSignatureProvider } from "@proton/js";
import * as fs from "fs";
import * as account from "../../account.json";

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

export class Claim {

  public action: any;
  constructor(private config: IUnstakeConfig) { }

  

  saveLog() {

    fs.writeFileSync(this.config.logPath, '');
    fs.writeFileSync(this.config.logPath, JSON.stringify(this.action, null, 2));

  }

}


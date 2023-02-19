import * as fs from "fs";


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

export class Rewards {

  public action: any;
  constructor(private config: IUnstakeConfig) { }

  generateUpdateAction(account: string): any {

    this.action = {
      account: 'snipstake',
      name: 'reward.updt',
      authorization: this.config.authorizations,
      data: {
        account: account,
      }
    }

    return this.action
  }

  generateClaimAction(account: string,amount:number): any {

    this.action = {
      account: 'snipstake',
      name: 'reward.claim',
      authorization: this.config.authorizations,
      data: {
        account: account,
        amount:amount
      }
    }

    return this.action
  }

  saveLog() {

    fs.writeFileSync(this.config.logPath, '');
    fs.writeFileSync(this.config.logPath, JSON.stringify(this.action, null, 2));

  }

}


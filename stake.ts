import { Api, JsonRpc, JsSignatureProvider } from "@proton/js";
import * as fs from "fs";
import * as account from "./account.json";

const EPS = [
  "https://testnet.brotonbp.com",
  "https://api-protontest.saltant.io",
  "https://api.testnet.protongb.com",
  "https://testnet-api.protongroup.info",
  "https://test.proton.kiwi",
  "https://bptestnet.xprasia.com",
];

export class StakeTest {
  private rpc: JsonRpc = new JsonRpc(EPS);
  private sign: JsSignatureProvider = new JsSignatureProvider([
    "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
  ]);
  private api = new Api({ rpc: this.rpc, signatureProvider: this.sign });

  async doTest() {
    const action = {
      account: account.actor,
      name: "transfer",
      authorization: [{ actor: "crotte", permission: "active" }],
      data: {
        from: "crotte",
        to: account.actor,
        amount: Math.floor(Math.random() * 100000000)+10000,
      },
      //10000.0000
    };
    return await this.api.transact(
      {
        actions: [action],
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      }
    );
  }
}

async function wait(timeInMS: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), timeInMS);
  });
}

async function main() {
  const stakeTest: StakeTest = new StakeTest();
  const results = Promise.all(
    Array(500)
      .fill({})
      .map(async () => {
        console.log ("run")
        await wait(2000)
        return await stakeTest.doTest();
      })
  );
  const result = await stakeTest.doTest();
  fs.writeFileSync("./stakes.json", JSON.stringify(results, null, 4));
}

main();

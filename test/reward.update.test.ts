
import { test } from "@jest/globals";
import { Api, JsonRpc, JsSignatureProvider } from "@proton/js";
import expect from "expect";
import { Rewards } from "./phases/rewards";
import { wait } from "./phases/wait";

export const STAKING_DURATION_MONTH:number = 1000*60*60*24*30;
export const STAKING_DURATION_DAY:number = 1000*60*60*24;

export const STAKING_TYPE_CLAIM:string = 'staking.claim';
export const STAKING_TYPE_STAKE:string = 'staking.stake';
export const STAKING_TYPE_UNSTAKE:string = 'staking.unstake';

const EPS = [
    "https://testnet.brotonbp.com",
    "https://api-protontest.saltant.io",
    "https://api.testnet.protongb.com",
    "https://testnet-api.protongroup.info",
    "https://test.proton.kiwi",
    "https://bptestnet.xprasia.com",
];

test ('Should update the reward amount',async ()=>{
    await wait(2000)
    const rpc: JsonRpc = new JsonRpc(EPS);
    const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
        "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
    ]);
    const api = new Api({ rpc, signatureProvider });

    const claim = new Rewards({
        account: 'crotte',
        authorizations: [
            {
                actor: 'crotte',
                permission: 'active'
            }
        ],
        logPath: 'test/logs/claim.update.json'
    })

    const action = claim.generateUpdateAction('crotte');
    claim.saveLog();
    return api.transact({
        actions: [action]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
        sign: true
    })

})

test ('Crotte should have a the same reward amount rewards amount',async ()=>{
    await wait(2000)
    const rpc: JsonRpc = new JsonRpc(EPS);
    const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
        "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
    ]);
    const api = new Api({ rpc, signatureProvider });
    const stakesResult = await api.rpc.get_table_rows({
        code: "snipstake",
        table: "stakes",
        scope: "crotte",
        limit:1000
        //reverse:true

    })

    const now = new Date();
    
    const totalReward = stakesResult.rows.reduce((prev,row)=>{

        const days = (now.getTime() - row.createdDate) / STAKING_DURATION_DAY;   
        if (row.type == STAKING_TYPE_STAKE)prev += Math.ceil(((row.stakeAmount * 10) / 100 / 365) * days);
        return prev;

    },0)
    
    const result = await api.rpc.get_table_rows({
        code: "snipstake",
        table: "accounts",
        scope: "snipstake",
        limit: 1000,
        
        //reverse:true

    })


    

    expect(result.rows[0].rewardsAmount).toBeCloseTo(totalReward,-7);
    return;

})
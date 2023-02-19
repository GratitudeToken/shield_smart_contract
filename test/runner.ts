import { test } from "@jest/globals";
import { Api, JsonRpc, JsSignatureProvider } from "@proton/js";
import assert from "assert";
import expect from "expect";
import { Unstake } from "./phases/unstake";
import { Stake } from "./phases/stake"
import { Rewards } from "./phases/rewards";
import { Clear } from "./phases/clear";
import { Transfer } from "./phases/transfer";

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

    const rpc: JsonRpc = new JsonRpc(EPS);
    const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
        "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
    ]);
    const api = new Api({ rpc, signatureProvider });

    const stakesResult = await api.rpc.get_table_rows({
        code: "snipstake",
        table: "stakes",
        scope: "crotte",
        //reverse:true

    })

    const now = new Date();
    const totalReward = stakesResult.rows.reduce((prev,row)=>{

        const days = (now.getTime() - row.createdDate) / STAKING_DURATION_DAY;
        if (row.type == STAKING_TYPE_STAKE)prev += ((row.stakeAmount * 0.01) / 100 / 365) * days;

    },0)
    
const result = await api.rpc.get_table_rows({
        code: "snipstake",
        table: "accounts",
        scope: "snipstake",
        //reverse:true

    })

    expect(result.rows[0].unstakeAmount).toEqual(totalReward);
    return;

})

test ('Should update the unstakeAmount',async ()=>{

    const rpc: JsonRpc = new JsonRpc(EPS);
    const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
        "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
    ]);
    const api = new Api({ rpc, signatureProvider });

    const unstake = new Unstake({
        account: 'crotte',
        authorizations: [
            {
                actor: 'crotte',
                permission: 'active'
            }
        ],
        logPath: 'test/logs/unstake.update.json'
    })

    const action = unstake.generateAction('crotte');
    unstake.saveLog();
    return api.transact({
        actions: [action]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
        sign: true
    })

})






test ('Crotte should have a greater rewards amount',async ()=>{

    const rpc: JsonRpc = new JsonRpc(EPS);
    const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
        "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
    ]);
    const api = new Api({ rpc, signatureProvider });

    const result = await api.rpc.get_table_rows({
        code: "snipstake",
        table: "accounts",
        scope: "snipstake",
        //reverse:true

    })

    expect(result.rows[0].rewardsAmount).toBeGreaterThan(0);
    return;

})

test ('Should claim the whole reward amount amount',async ()=>{

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

    const result = await api.rpc.get_table_rows({
        code: "snipstake",
        table: "accounts",
        scope: "snipstake",
        //reverse:true

    })

    expect(result.rows[0].rewardsAmount).toBeGreaterThan(0);

    const action = claim.generateClaimAction('crotte',parseInt(result.rows[0].rewardsAmount));
    claim.saveLog();
    return api.transact({
        actions: [action]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
        sign: true
    })

})

test ('The reward amount should be 0 now',async ()=>{

    const rpc: JsonRpc = new JsonRpc(EPS);
    const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
        "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
    ]);
    const api = new Api({ rpc, signatureProvider });

    const result = await api.rpc.get_table_rows({
        code: "snipstake",
        table: "accounts",
        scope: "snipstake",
        //reverse:true

    })

    expect(result.rows[0].rewardsAmount).toBe(0);
    return;

})


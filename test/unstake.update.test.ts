import { test } from "@jest/globals";
import { Api, JsonRpc, JsSignatureProvider } from "@proton/js";
import expect from "expect";

import { Clear } from "./phases/clear";
import { Rewards } from "./phases/rewards";
import { Stake } from "./phases/stake";
import { Transfer } from "./phases/transfer";
import { Unstake } from "./phases/unstake";
import { wait } from "./phases/wait";
import { toPrecision } from "./utils/Number";

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


test('Must clear the contract tables and revert staked amount', async () => {
    
    const rpc: JsonRpc = new JsonRpc(EPS);
    const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
        "PVT_K1_2LaFF1DCSkbyui8P2JRFxr8LULvS3uNnWZqfgBf3ehGovBxUdC",
    ]);
    const api = new Api({ rpc, signatureProvider });

    const snipxResult =  await api.rpc.get_currency_balance('snipx','snipstake','SNIPX');

    const snipxBalance = parseFloat(snipxResult[0]);
    
    const clear = new Clear({
        authorizations:[{
            actor:'snipstake',
            permission:'active'
        }],
        logPath:'test/logs/clear.json'
    })
    const transfer = new Transfer({
        from: "snipstake",
        to: "crotte",
        totalAmount: snipxBalance,
        authorizations: [
            {
                actor: 'snipstake',
                permission: 'active'
            }
        ],
        logPath: 'test/logs/clear.json'
    })
    
    return api.transact({
        actions:[
            clear.generateAction('crotte'),
            transfer.generateAction('snipstake','crotte',`${toPrecision(snipxBalance,4)} SNIPX`,'revert')
        ]
    },{
        blocksBehind:3,
        expireSeconds:30,
        sign:true
    })
})

test('UNSTAKE: Should apply multiple transfer and stake for 10.000.000 SNIPX at to reach level.advisor', async () => {
    
    const rpc: JsonRpc = new JsonRpc(EPS);
    const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
        "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
    ]);
    const api = new Api({ rpc, signatureProvider });

    const stake = new Stake({
        from: 'crotte',
        to: "snipstake",
        totalAmount: 10000000,
        actionsCount: 26,
        authorizations: [
            {
                actor: 'crotte',
                permission: 'active'
            }
        ],
        logPath: 'test/logs/stake.pro-level.json'
    })

    const actions = stake.generateStakeActions();

    stake.saveLog()
    return api.transact({
        actions: actions
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
        sign: true
    })

})

test ('UNSTAKE: Should update the unstake amount',async ()=>{

    await wait(2000)
    const rpc: JsonRpc = new JsonRpc(EPS);
    const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
        "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
    ]);
    const api = new Api({ rpc, signatureProvider });

    const claim = new Unstake({
        account: 'crotte',
        authorizations: [
            {
                actor: 'crotte',
                permission: 'active'
            }
        ],
        logPath: 'test/logs/claim.update.json'
    })

    const action = claim.generateUnstakeUpdateAction('crotte');
    claim.saveLog();
    return api.transact({
        actions: [action]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
        sign: true
    })

})

test ('UNSTAKE: Crotte should have a the same unstake amount ',async ()=>{

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

    
    const unsakeTotal = stakesResult.rows.reduce((prev, row) => {
  
      if (row.type == STAKING_TYPE_STAKE && (now.getTime() - row.createdDate) >= STAKING_DURATION_MONTH )prev += row.stakeAmount;
      if (row.type == STAKING_TYPE_UNSTAKE )prev -= row.stakeAmount;
      return prev;

    },0)
    
    const result = await api.rpc.get_table_rows({
        code: "snipstake",
        table: "accounts",
        scope: "snipstake",
        limit:1000
        //reverse:true

    })

    expect(parseInt(result.rows[0].stakesAmount)).toEqual(unsakeTotal);
    return;

})

test('Crotte account should be level.advisor', async () => {
    
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

    expect(result.rows[0].level).toContain("level.advisor");
    return;

})

test ('UNSTAKE: Should unstake 1 SNIPX',async ()=>{

    await wait(2000)
    const rpc: JsonRpc = new JsonRpc(EPS);
    const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
        "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
    ]);
    const api = new Api({ rpc, signatureProvider });

    const claim = new Unstake({
        account: 'crotte',
        authorizations: [
            {
                actor: 'crotte',
                permission: 'active'
            }
        ],
        logPath: 'test/logs/claim.update.json'
    })

    const action = claim.generateUnstakeAction('crotte',10000);
    claim.saveLog();
    return api.transact({
        actions: [action]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
        sign: true
    })

})


test ('UNSTAKE: Should update the unstake amount',async ()=>{

    await wait(2000)
    const rpc: JsonRpc = new JsonRpc(EPS);
    const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
        "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
    ]);
    const api = new Api({ rpc, signatureProvider });

    const claim = new Unstake({
        account: 'crotte',
        authorizations: [
            {
                actor: 'crotte',
                permission: 'active'
            }
        ],
        logPath: 'test/logs/claim.update.json'
    })

    const action = claim.generateUnstakeUpdateAction('crotte');
    claim.saveLog();
    return api.transact({
        actions: [action]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
        sign: true
    })

})

test ('UNSTAKE: Crotte should have a the same unstake amount ',async ()=>{

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

    
    const unsakeTotal = stakesResult.rows.reduce((prev,row)=>{
  
      if (row.type == STAKING_TYPE_STAKE && (now.getTime() - row.createdDate) >= STAKING_DURATION_MONTH) prev += row.stakeAmount;
      if (row.type == STAKING_TYPE_UNSTAKE )prev -= row.stakeAmount;
      return prev;

    },0)
    
    const result = await api.rpc.get_table_rows({
        code: "snipstake",
        table: "accounts",
        scope: "snipstake",
        limit:1000
        //reverse:true

    })

    expect(parseInt(result.rows[0].stakesAmount)).toEqual(unsakeTotal);
    return;

})

test('Crotte account should be level.pro', async () => {
    
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

    expect(result.rows[0].level).toContain("level.pro");
    return;

})

test ('UNSTAKE: Should unstake 1.000.000 SNIPX',async ()=>{

  await wait(2000)
  const rpc: JsonRpc = new JsonRpc(EPS);
  const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
      "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
  ]);
  const api = new Api({ rpc, signatureProvider });

  const claim = new Unstake({
      account: 'crotte',
      authorizations: [
          {
              actor: 'crotte',
              permission: 'active'
          }
      ],
      logPath: 'test/logs/claim.update.json'
  })

  const action = claim.generateUnstakeAction('crotte',10000000000);
  claim.saveLog();
  return api.transact({
      actions: [action]
  }, {
      blocksBehind: 3,
      expireSeconds: 30,
      sign: true
  })

})

test('Crotte account should be level.pro', async () => {
    
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

  expect(result.rows[0].level).toContain("level.pro");
  return;

})

test ('UNSTAKE: Should unstake 7.999.999 SNIPX',async ()=>{

  await wait(2000)
  const rpc: JsonRpc = new JsonRpc(EPS);
  const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
      "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
  ]);
  const api = new Api({ rpc, signatureProvider });

  const claim = new Unstake({
      account: 'crotte',
      authorizations: [
          {
              actor: 'crotte',
              permission: 'active'
          }
      ],
      logPath: 'test/logs/claim.update.json'
  })

  const action = claim.generateUnstakeAction('crotte',79999990000);
  claim.saveLog();
  return api.transact({
      actions: [action]
  }, {
      blocksBehind: 3,
      expireSeconds: 30,
      sign: true
  })

})

test('Crotte account should be level.pro', async () => {
    
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

  expect(result.rows[0].level).toContain("level.pro");
  return;

})


test ('UNSTAKE: Should unstake 1 SNIPX',async ()=>{

  await wait(2000)
  const rpc: JsonRpc = new JsonRpc(EPS);
  const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
      "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
  ]);
  const api = new Api({ rpc, signatureProvider });

  const claim = new Unstake({
      account: 'crotte',
      authorizations: [
          {
              actor: 'crotte',
              permission: 'active'
          }
      ],
      logPath: 'test/logs/claim.update.json'
  })

  const action = claim.generateUnstakeAction('crotte',10000);
  claim.saveLog();
  return api.transact({
      actions: [action]
  }, {
      blocksBehind: 3,
      expireSeconds: 30,
      sign: true
  })

})

test('Crotte account should be level.lite', async () => {
    
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

  expect(result.rows[0].level).toContain("level.lite");
  return;

})

test('UNSTAKE: Should unstake 899999 SNIPX', async () => {

  await wait(2000)
  const rpc: JsonRpc = new JsonRpc(EPS);
  const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
      "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
  ]);
  const api = new Api({ rpc, signatureProvider });

  const claim = new Unstake({
      account: 'crotte',
      authorizations: [
          {
              actor: 'crotte',
              permission: 'active'
          }
      ],
      logPath: 'test/logs/claim.update.json'
  })

  const action = claim.generateUnstakeAction('crotte',8999990000);
  claim.saveLog();
  return api.transact({
      actions: [action]
  }, {
      blocksBehind: 3,
      expireSeconds: 30,
      sign: true
  })

})

test('Crotte account should be level.lite', async () => {
    
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

  expect(result.rows[0].level).toContain("level.lite");
  return;

})

test('UNSTAKE: Should unstake 1 SNIPX', async () => {

  await wait(2000)
  const rpc: JsonRpc = new JsonRpc(EPS);
  const signatureProvider: JsSignatureProvider = new JsSignatureProvider([
      "PVT_K1_oUGCrr8wZ89XQBh1gZu6rMGY8STf4c6tcWrT9denafcWJZx9x",
  ]);
  const api = new Api({ rpc, signatureProvider });

  const claim = new Unstake({
      account: 'crotte',
      authorizations: [
          {
              actor: 'crotte',
              permission: 'active'
          }
      ],
      logPath: 'test/logs/claim.update.json'
  })

  const action = claim.generateUnstakeAction('crotte',10000);
  claim.saveLog();
  return api.transact({
      actions: [action]
  }, {
      blocksBehind: 3,
      expireSeconds: 30,
      sign: true
  })

})

test('Crotte account should be level.free', async () => {
    
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

  expect(result.rows[0].level).toContain("level.free");
  return;

})
import { test } from "@jest/globals";
import { Api, JsonRpc, JsSignatureProvider } from "@proton/js";
import expect from "expect";
import { Stake } from "./phases/stake"

import { Clear } from "./phases/clear";
import { Transfer } from "./phases/transfer";
import { toPrecision } from "./utils/Number";
import { wait } from "./phases/wait";

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
    console.log(snipxBalance);

    const clear = new Clear({
        authorizations:[{
            actor:'snipstake',
            permission:'active'
        }],
        logPath:'test/logs/clear.json'
    })
    const transfer = new Transfer({
        from: 'snipstake',
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


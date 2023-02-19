export function toPrecision (amount:number,precision:number= 3){

    const amountStr = amount.toString();
    return `${amountStr}.${Array(precision).fill(0).join('')}`



}
export function toPrecision(value:number, precision:number):string {

    if (isNaN(value)) throw new Error('Value is not a number')
    const regex = /([0-9]*)(?:\.{0,1})([0-9]*)/g;
    const r = regex.exec(value.toString())
    if (!r) throw new Error('Value cannot be parsed')
    let decimal = Array(precision).fill(0).join('');
    if (parseInt(r[2])>0){

        decimal = r[2].slice(0,precision);
        if(precision > decimal.length ){
            decimal = decimal.padEnd(precision,'0')
            decimal = decimal.slice(0,precision)
        }
    
    }

    return [r[1],decimal].join('.');
    

}
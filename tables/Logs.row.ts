import { Table } from "proton-tsc";

@table('logs')
export class LogRow extends Table {

    constructor(
        public key: u64 = 0,
        public log:string = ""

    ) { 

        super();

    }

    @primary
    get by_key(): u64{
        
        return this.key

    }
    
    set by_key(value:u64){
        
        this.key = value;

    }


 }
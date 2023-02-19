import { EMPTY_ASSET } from "./../constants";
import { Asset, EMPTY_NAME, Name, Table } from "proton-tsc";

@table('rewardpool')
export class RewardPool extends Table {

    constructor(
        public key: Name = EMPTY_NAME,
        public pool:Asset = EMPTY_ASSET

    ) { 

        super();

    }

    @primary
    get by_key(): u64{
        
        return this.key.N

    }
    
    set by_key(value:u64){
        
        this.key = Name.fromU64(value);

    }


 }
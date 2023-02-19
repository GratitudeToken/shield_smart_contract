import { EMPTY_ASSET } from "./../constants";
import { Asset, Table } from "proton-tsc";

@table("stakes")
export class StakeRow extends Table {
  constructor(
    public key:u64 = 0,
    public stakeAmount:Asset = EMPTY_ASSET,
    public createdDate:i64 = 0,
    public type:string = ""
  ) {
    super();
  }

  @primary
  get by_key():u64 {
    return this.key
  }
  
  set by_key(value:u64) {
    this.key = value;
  }
}

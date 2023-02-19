import { EMPTY_ASSET } from "./../constants";
import { Asset, EMPTY_NAME, Name, Table } from "proton-tsc";

@table("accounts")
export class AccountRow extends Table {
  constructor(
    public key:Name = EMPTY_NAME,
    //public rewardsAmount:Asset = EMPTY_ASSET,
    public stakesAmount:Asset = EMPTY_ASSET,
    //public unstakeAmount:Asset = EMPTY_ASSET,
    public releaseFundDate:i64 = 0,
    public level:string = ""
  ) {
    super();
  }

  @primary
  get by_key():u64 {
    return this.key.N;
  }
  
  set by_key(value:u64) {
    this.key = Name.fromU64(value);
  }
}

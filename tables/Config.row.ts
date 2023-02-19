import { Table } from "proton-tsc";

@table("config")
export class ConfigRow extends Table {
  constructor(
    public key: u64 = 0,
    public apr: u8 = 0,
    public minStakeDuration: i64 = 0,
    public suspended: u8 = 0
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

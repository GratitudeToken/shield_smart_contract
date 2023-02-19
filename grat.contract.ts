import {
  TOKEN_SYMBOL,
  EMPTY_ASSET,
  REWARD_POOL_SOURCE,
  TOKEN_CONTRACT,
  ACCOUNT_LEVEL_GUARDIAN,
  ACCOUNT_LEVEL_VISIONARY,
  STAKING_DURATION_YEAR,
  STAKING_DURATION_DAY,
} from "./constants";
import {
  Asset,
  check,
  Contract,
  currentTime,
  ExtendedAsset,
  isAccount,
  Name,
  requireAuth,
  Symbol,
  TableStore,
  TimePoint,
} from "proton-tsc";
import { ConfigRow, StakeRow, AccountRow, RewardPool } from "./tables";
import { sendTransferTokens } from "proton-tsc/token";
import { LogRow } from "./tables/Logs.row";


@contract
export class snipstake extends Contract {
 
  private logsTable :TableStore<LogRow> = new TableStore<LogRow>(
    this.receiver
  );

  private configTable: TableStore<ConfigRow> = new TableStore<ConfigRow>(
    this.receiver
  );

  private accountTable: TableStore<AccountRow> = new TableStore<AccountRow>(
    this.receiver
  );

  private rewardPoolTable: TableStore<RewardPool> = new TableStore<RewardPool>(
    this.receiver
  )

  @action("transfer", notify)
  transfer(from: Name, to: Name, quantity: Asset, memo: string): void {

    //TODO: Check if level of guardian or visionary is reached than update the releaseFundDate
    //TODO: Remove references to REWARD_POOL_SOURCE
    if (from != REWARD_POOL_SOURCE) {
      
      if (from == this.receiver) return;
      check(isAccount(to), `${to.toString()} is not an existing account`);
      check(
        quantity.symbol.getSymbolString().toUpperCase() == TOKEN_SYMBOL,
        `Only ${TOKEN_SYMBOL} token is allowed to stake`
      );

      
      const now: TimePoint = new TimePoint(currentTime());
      
      let accountRow = this.accountTable.get(from.N);
      if (!accountRow) {
        accountRow = new AccountRow(
          from,
          quantity,
          now.msSinceEpoch()+STAKING_DURATION_YEAR,
          this.getAccountLevel(quantity.amount)
          
        );
      } else {
        if (accountRow.level == '')accountRow.releaseFundDate = now.msSinceEpoch();
        accountRow.stakesAmount.amount += quantity.amount;
        accountRow.level = this.getAccountLevel(accountRow.stakesAmount.amount);
      }

      this.accountTable.set(accountRow, this.receiver);
      
    } 
  }

  //#################
  //### STAKE #######
  //#################

  //TODO: Keep only this action
  @action("stake.unstk")
  unstake(account: Name): void {
    
    requireAuth(account);
    const now: TimePoint = new TimePoint(currentTime());
    const accountToUpdate: AccountRow = this.accountTable.requireGet(account.N, `Cannot find ${account.toString()}`);
    const remainingDays = (accountToUpdate.releaseFundDate - now.msSinceEpoch())/STAKING_DURATION_DAY
    check(accountToUpdate.releaseFundDate > now.msSinceEpoch(), `It's not time to unstake yet, it's remain ${remainingDays}`);
    const unstakeAsset = EMPTY_ASSET
    unstakeAsset.amount = accountToUpdate.stakesAmount.amount; 
    sendTransferTokens(
      this.receiver,
      account,
      [
        new ExtendedAsset(
          accountToUpdate.stakesAmount,
          TOKEN_CONTRACT
        ),
      ],
      "Unstake"
    );  
    accountToUpdate.stakesAmount.amount = 0;
    
    //TODO: 
    
    this.accountTable.update(accountToUpdate, this.receiver);
    
  }
  
  //#################
  //### ADMIN ###
  //#################
  @action('admin.level')
  createLevel(levelName: Name, minStakeAmount: i64, minStakeTime: i64):void {
    
    requireAuth(this.receiver);

  }
  
  @action('admin.uplvl')
  updateLevel(levelName: Name, minStakeAmount: i64, minStakeTime: i64):void {
    
    requireAuth(this.receiver);

  }
  @action('admin.rst')
  reset(account: Name):void {
    requireAuth(this.receiver);
    const now: TimePoint = new TimePoint(currentTime());
    const accountToUpdate: AccountRow = this.accountTable.requireGet(account.N, `Cannot find ${account.toString()}`);
    if (!accountToUpdate) return;
    accountToUpdate.level = '';
    accountToUpdate.stakesAmount.amount = 0;
    accountToUpdate.releaseFundDate = now.msSinceEpoch();
    this.accountTable.update(accountToUpdate, this.receiver);

  }

  
  //#################
  //### INTERNALS ###
  //#################

  private getAccountLevel(amount: u64): string  {

    //TODO: Define level amount more clearly
    if (amount >= 999999999) return ACCOUNT_LEVEL_GUARDIAN;
    if (amount >= 999999999) return ACCOUNT_LEVEL_VISIONARY;
    return '';
    100000000
    
  }
}

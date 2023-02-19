import { Asset, Name, Symbol } from "proton-tsc";

//TestNet
export const TOKEN_SYMBOL:string = "GRAT";
export const TOKEN_NAME: Name = Name.fromString("grat");
export const TOKEN_CONTRACT: Name = Name.fromString("grat");
export const REWARD_POOL_SOURCE:Name = Name.fromString("gratstake");
export const EMPTY_ASSET:Asset = new Asset(0,new Symbol('GRAT',8));



// Production
/*
export const TOKEN_SYMBOL: string = "SNIPS";
export const TOKEN_NAME: Name = Name.fromString("snips");
export const TOKEN_CONTRACT: Name = Name.fromString("snipcoins");
export const REWARD_POOL_SOURCE:Name = Name.fromString("snipsrewards");
export const EMPTY_ASSET:Asset = new Asset(0,new Symbol('SNIPS',4));
*/
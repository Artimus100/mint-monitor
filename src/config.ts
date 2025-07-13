import dotenv from "dotenv";
dotenv.config();

export const ENDPOINT = process.env.ENDPOINT || "";
export const TOKEN = process.env.TOKEN || "";

export const PUMP_PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
export const PUMP_FUN_CREATE_IX_DISCRIMINATOR = Buffer.from([24, 30, 200, 40, 5, 28, 7, 119]);

export const COMMITMENT = "finalized";

export const FILTER_CONFIG = {
  programIds: [PUMP_PROGRAM_ID],
  instructionDiscriminators: [PUMP_FUN_CREATE_IX_DISCRIMINATOR],
};

export const ACCOUNTS_TO_INCLUDE = [
  { name: "mint", index: 0 },
  { name: "bonding_curve", index: 2 },
  { name: "associated_bonding_curve", index: 3 },
  { name: "user", index: 7 },
];

export const CREATE_INSTRUCTION_ARGS = [
  { name: "name", type: "string" },
  { name: "symbol", type: "string" },
  { name: "uri", type: "string" },
  { name: "creator", type: "pubkey" },
];
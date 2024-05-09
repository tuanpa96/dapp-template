import { Commitment, Connection } from "@solana/web3.js";

const TESTNET_RPC_URL = "https://api-testnet.renec.foundation:8899";

export const getConnection = (commitment: Commitment = "confirmed") => {
  return new Connection(TESTNET_RPC_URL, { commitment });
};

import { PublicKey } from "@solana/web3.js";

export const addressValid = (address: string) => {
  if (!address) return false;

  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

import bs58 from "bs58";
import Decimal from "decimal.js";

import { DecimalUtil } from "@orca-so/common-sdk";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Keypair,
  ParsedAccountData,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";

import { getConnection } from "./rpc";
import { toU64 } from "./utils";

export type RplTokenBalances = {
  [tokenAddress: string]: number;
};

export const generateNewKey = () => {
  const keypair = Keypair.generate();
  const pubKey = keypair.publicKey.toBase58();
  const privKey = bs58.encode(keypair.secretKey);

  // eslint-disable-next-line no-console
  console.log("[wallet] new key pair", { PK: pubKey, SK: privKey });

  return privKey;
};

export const e2ePrivKey = String(
  process.env.CYPRESS_E2E_WALLET_PRIVATE_KEY || generateNewKey()
);
export const treasuryPrivKey = String(process.env.CYPRESS_TREASURY_PRIVATE_KEY);

export const TOKENS: Record<string, string> = {
  RENEC: "So11111111111111111111111111111111111111112",
  REUSD: "Afy8qEgeJykFziRwiCk6tnBbd3uzxMoEqn2GTNCyGN7P",
  REVND: "DSodi59U9ZWRnVgP94VNnKamFybYpsqYj2iKL1jQF7Ag",
  RENGN: "CHe7TGhNzxpqiW6pdVJ2H2Mw5t7yHXTNyCfzJ1WFR5Dw",
};

export const TOKENS_DECIMALS: Record<string, number> = {
  RENEC: 9,
  REUSD: 9,
  REVND: 0,
  RENGN: 0,
};

export const TOKENS_AIRDROP_BALANCE: Record<string, number> = {
  RENEC: 1, // testnet limit: 100 RENEC/minute
  REUSD: 20,
  REVND: 2000000,
  RENGN: 10000,
};

export const getKeypair = (privKey?: string) => {
  if (privKey) {
    const keypair = Keypair.fromSecretKey(bs58.decode(privKey));
    return keypair;
  }
  return Keypair.generate();
};

export const getPublicKey = (privKey?: string) => {
  const walletPrivKey = privKey || e2ePrivKey;
  return getKeypair(walletPrivKey).publicKey.toBase58();
};

export const getBalances = async (pubKey?: string) => {
  const walletPubKey = new PublicKey(pubKey || getPublicKey(e2ePrivKey));
  const connection = getConnection();

  const result: RplTokenBalances = {};

  try {
    const accounts = await connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID,
      {
        filters: [
          {
            dataSize: 165, //size of account (bytes)
          },
          {
            memcmp: {
              offset: 32, //location of our query in the account (bytes)
              bytes: walletPubKey.toBase58(), //our search criteria, a base58 encoded string
            },
          },
        ],
      }
    );

    accounts.forEach((account) => {
      const parsedAccountInfo = account.account.data as ParsedAccountData;

      const tokenAddress: string = parsedAccountInfo.parsed.info.mint;
      const tokenBalance: number =
        parsedAccountInfo.parsed.info.tokenAmount.uiAmount;

      result[tokenAddress] = tokenBalance;
    });

    const bal = await connection.getBalance(walletPubKey);
    result["RENEC"] = DecimalUtil.fromNumber(bal, 9).toNumber();
  } catch (e) {
    /* empty */
  }

  // eslint-disable-next-line no-console
  console.log("[wallet] balances", walletPubKey.toBase58(), result);

  return result;
};

export const transferToken = async (args: {
  fromPrivKey?: string;
  token: string | { decimals: number; mintAddress: string };
  amount: number;
  toPubKey?: string;
}) => {
  const { fromPrivKey, token, toPubKey } = args;
  let { amount } = args;

  if (typeof token === "string" && !(token in TOKENS)) {
    throw new Error(`Token name ${token} is not supported.`);
  }

  const connection = getConnection();

  const fromWalletPrivKey = fromPrivKey || treasuryPrivKey;
  const fromWallet = getKeypair(fromWalletPrivKey);
  const toWalletPubKey = new PublicKey(toPubKey || getPublicKey(e2ePrivKey));

  // eslint-disable-next-line no-console
  console.log("[wallet] transfer", {
    amount,
    token,
    fromPrivKey: fromPrivKey || "treasury",
    toPubKey: toWalletPubKey.toBase58(),
  });

  if (
    typeof token === "string"
      ? token === "RENEC"
      : token.mintAddress === "So11111111111111111111111111111111111111112"
  ) {
    if (amount < 0.001) {
      // eslint-disable-next-line no-console
      console.log(
        "[wallet] corrected RENEC amount:",
        amount,
        "->",
        0.001,
        "(min/transfer)"
      );

      amount = 0.001;
    }

    try {
      if (!fromPrivKey) {
        await connection.requestAirdrop(
          toWalletPubKey,
          parseInt(toU64(amount, TOKENS_DECIMALS.RENEC).toString(), 10)
        );

        return { fromPrivKey: null, toPubKey: toWalletPubKey };
      }
    } catch (err) {
      /* empty */
    }
  }

  const tokenMintAddress = new PublicKey(
    typeof token === "string" ? TOKENS[token] : token.mintAddress
  );
  const tokenDecimals =
    typeof token === "string" ? TOKENS_DECIMALS[token] : token.decimals;

  const splToken = new Token(
    connection,
    tokenMintAddress,
    TOKEN_PROGRAM_ID,
    fromWallet
  );
  const senderTokenAccount = await splToken.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
  );
  const receiverTokenAccount = await splToken.getOrCreateAssociatedAccountInfo(
    toWalletPubKey
  );

  const tx = new Transaction().add(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      senderTokenAccount.address,
      receiverTokenAccount.address,
      fromWallet.publicKey,
      [],
      parseInt(toU64(amount, tokenDecimals).toString(), 10)
    )
  );

  await sendAndConfirmTransaction(connection, tx, [fromWallet]);

  return {
    fromPrivKey: fromWalletPrivKey,
    toPubKey: toWalletPubKey,
  };
};

export const requestAirdrop = async (args: {
  pubKey?: string;
  tokenNames?: string[];
}) => {
  const needToRequestTokenNames = args.tokenNames || [
    "RENEC",
    "REUSD",
    "REVND",
    "RENGN",
  ];
  const walletPubKey = args.pubKey || getPublicKey(e2ePrivKey);

  // eslint-disable-next-line no-console
  console.log("[wallet] airdrop for", walletPubKey, needToRequestTokenNames);

  const balances = await getBalances(walletPubKey);

  for (const key of needToRequestTokenNames) {
    const balance = new Decimal(
      balances[key === "RENEC" ? key : TOKENS[key]] || 0
    );
    const amount = TOKENS_AIRDROP_BALANCE[key];
    const needToRequestAmount = balance.lt(amount)
      ? new Decimal(amount).sub(balance)
      : new Decimal(0);

    if (needToRequestAmount.gt(0)) {
      await transferToken({
        token: key,
        amount: needToRequestAmount.toNumber(),
        toPubKey: walletPubKey,
      });
    }
  }

  return walletPubKey;
};

export const getTreasuryPrivKey = () => treasuryPrivKey;

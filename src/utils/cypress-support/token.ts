import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

import { getConnection } from "./rpc";
import {
  e2ePrivKey,
  getKeypair,
  getPublicKey,
  treasuryPrivKey,
} from "./wallet";
import { toU64 } from "./utils";

const generateAssociatedTokenAccountAddress = (
  mint: PublicKey,
  buyer: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
};

const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: PublicKey,
  payer: PublicKey,
  walletAddress: PublicKey,
  splTokenMintAddress: PublicKey
) => {
  const keys = [
    {
      pubkey: payer,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: walletAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: splTokenMintAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new TransactionInstruction({
    keys,
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
};

export const createToken = async (decimals = 9) => {
  const connection = getConnection();
  const wallet = getKeypair(treasuryPrivKey);

  const mintAccount = getKeypair();
  const payer = wallet.publicKey;
  const mintAuthority = wallet.publicKey;
  const decimalsChain = decimals < 0 || decimals > 9 ? 9 : decimals;
  const lamports = await Token.getMinBalanceRentForExemptMint(connection);

  const userProgramAddressSync = generateAssociatedTokenAccountAddress(
    mintAccount.publicKey,
    wallet.publicKey
  );

  const transaction = new Transaction();

  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mintAccount.publicKey,
      space: MintLayout.span,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  transaction.add(
    Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      decimalsChain,
      mintAuthority,
      null
    )
  );

  transaction.add(
    createAssociatedTokenAccountInstruction(
      userProgramAddressSync,
      wallet.publicKey,
      wallet.publicKey,
      mintAccount.publicKey
    )
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  transaction.partialSign(mintAccount);

  await sendAndConfirmTransaction(connection, transaction, [
    wallet,
    mintAccount,
  ]);

  // eslint-disable-next-line no-console
  console.log(
    "[token] created",
    mintAccount.publicKey.toBase58(),
    `decimals=${decimalsChain}`
  );

  return {
    decimals: decimalsChain,
    mintAddress: mintAccount.publicKey.toBase58(),
  };
};

export const mintToken = async (args: {
  amount: number;
  decimals: number;
  tokenMintAddress: string;
  toPubKey?: string;
}) => {
  // eslint-disable-next-line no-console
  console.log("[token] mint", args);

  const { amount, decimals, tokenMintAddress, toPubKey } = args;

  const connection = getConnection();
  const mintOwner = getKeypair(treasuryPrivKey);
  const receiver = new PublicKey(toPubKey || getPublicKey(e2ePrivKey));

  const splToken = new Token(
    connection,
    new PublicKey(tokenMintAddress),
    TOKEN_PROGRAM_ID,
    mintOwner
  );
  const receiverTokenAccount = await splToken.getOrCreateAssociatedAccountInfo(
    receiver
  );

  await splToken.mintTo(
    receiverTokenAccount.address,
    mintOwner,
    [],
    toU64(amount, decimals)
  );

  return receiver;
};

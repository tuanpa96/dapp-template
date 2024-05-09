import LaunchIcon from "@/assets/icons/launch.svg";
import SettingsActive from "@/assets/icons/settings-active.svg";
import { IS_MAINNET, TOKEN_PROGRAM_ID } from "@/root/src/utils/constants";
import { formatAddressDisplay } from "@/utils/formatHelpers";
import {
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { MultisigJob, ProposalStateType } from "@renec-foundation/multisig-sdk";
import {
  ENV,
  TokenInfo,
  TokenListProvider,
} from "@renec-foundation/rpl-token-registry";
import { useConnection } from "@renec-foundation/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
  SystemInstruction,
  SystemProgram,
} from "@solana/web3.js";
import Image from "next/image";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import * as styles from "./styles";

const generateStatus = (stateType: number) => {
  const colorsMapping = {
    [ProposalStateType.Pending.toString()]: ["#efd688", "black", "Pending"],
    [ProposalStateType.Approved.toString()]: ["#00e5ff", "black", "Approved"],
    [ProposalStateType.Rejected.toString()]: ["redLight", "#fff", "Rejected"],
    [ProposalStateType.ExecutionInProgress.toString()]: [
      "orange",
      "#fff",
      "Execution In Progress",
    ],
    [ProposalStateType.Complete.toString()]: ["#133227", "#21D969", "Complete"],
    [ProposalStateType.Failed.toString()]: ["red", "#fff", "Failed"],
    [ProposalStateType.Aborted.toString()]: ["gray", "black", "Aborted"],
    [ProposalStateType.Deprecated.toString()]: [
      "brown",
      "#efd688",
      "Deprecated",
    ],
  };

  const [bgColor, textColor, text] = colorsMapping[stateType.toString()];

  return (
    <Box sx={[styles.statusStyle, { backgroundColor: bgColor }]}>
      <Typography sx={[styles.statusTextStyle, { color: textColor }]}>
        {text}
      </Typography>
    </Box>
  );
};

const generateDate = (createdAt: number) => {
  return new Date(createdAt * 1000).toLocaleString();
};

type transactionItemProps = {
  proposal: MultisigJob;
  safeAddress: string;
  isLast: boolean;
  isMobile: boolean;
};

const TransactionItem = ({
  safeAddress,
  proposal,
  isLast,
  isMobile,
}: transactionItemProps) => {
  const [balance, setBalance] = useState<number>(0);
  const [isTransfer, setIsTransfer] = useState(true);
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
  const [token, setToken] = useState<any>({
    symbol: "RENEC",
  });
  const { connection } = useConnection();

  useEffect(() => {
    new TokenListProvider().resolve().then((tokens) => {
      const tokenList = tokens
        .filterByChainId(IS_MAINNET ? ENV.MainnetBeta : ENV.Testnet)
        .getList();

      setTokenMap(
        tokenList.reduce((map, item) => {
          map.set(item.address, item);
          return map;
        }, new Map())
      );
    });
  }, []);

  useEffect(() => {
    const instructionTransfer = proposal.instructions.find((instruction) => {
      const programId = instruction.programId.toBase58();
      return (
        programId === SystemProgram.programId.toBase58() &&
        SystemInstruction.decodeInstructionType(instruction) === "Transfer"
      );
    });

    if (instructionTransfer) {
      const instructionDecode =
        SystemInstruction.decodeTransfer(instructionTransfer);
      setBalance(Number(instructionDecode.lamports) / LAMPORTS_PER_SOL);
    }

    const instructionTokenTransfer = proposal.instructions.find(
      (instruction) => {
        const programId = instruction.programId.toBase58();
        return (
          programId === TOKEN_PROGRAM_ID.toBase58() && instruction.data[0] === 3
        );
      }
    );

    if (instructionTokenTransfer && tokenMap) {
      (async () => {
        const tokenAccountInfo = await connection.getAccountInfo(
          instructionTokenTransfer.keys[1].pubkey
        );
        const lamports = Number(
          instructionTokenTransfer.data.readBigUInt64LE(1)
        );

        if (tokenAccountInfo?.owner.equals(TOKEN_PROGRAM_ID)) {
          const mintPublicKey = new PublicKey(
            tokenAccountInfo.data.slice(0, 32)
          );
          setToken(tokenMap.get(mintPublicKey.toBase58()));
          const tokenAddress = tokenMap.get(mintPublicKey.toBase58())?.address;
          let tokenDecimals = 9;
          if (tokenAddress) {
            const tokenAccountInfo = await connection.getParsedAccountInfo(
              new PublicKey(tokenAddress)
            );
            if (tokenAccountInfo?.value) {
              // Extract the decimals value from the token account data
              tokenDecimals = (tokenAccountInfo.value.data as ParsedAccountData)
                .parsed.info.decimals;
            }
          }
          if (tokenDecimals > 0) {
            setBalance(lamports / LAMPORTS_PER_SOL);
          } else {
            setBalance(lamports);
          }
        } else {
          const instructionCreateTokenAccount = proposal.instructions.find(
            (instruction) => {
              return instruction.data[0] !== 3;
            }
          );

          if (instructionCreateTokenAccount) {
            const mintPublicKey = new PublicKey(
              instructionCreateTokenAccount.keys[3].pubkey
            );
            setToken(tokenMap.get(mintPublicKey.toBase58()));
            const tokenAddress = tokenMap.get(
              mintPublicKey.toBase58()
            )?.address;

            let tokenDecimals = 9;
            if (tokenAddress) {
              const tokenAccountInfo = await connection.getParsedAccountInfo(
                new PublicKey(tokenAddress)
              );

              if (tokenAccountInfo?.value) {
                tokenDecimals = (
                  tokenAccountInfo.value.data as ParsedAccountData
                ).parsed.info.decimals;
              }
            }

            if (tokenDecimals > 0) {
              setBalance(lamports / LAMPORTS_PER_SOL);
            } else {
              setBalance(lamports);
            }
          }
        }
      })();
    }

    setIsTransfer(!!(instructionTransfer || instructionTokenTransfer));
  }, [connection, proposal.instructions, tokenMap]);

  if (isMobile) {
    return (
      <Box sx={styles.boxStyle}>
        <Link
          href={`/safe/${safeAddress}/transactions/${proposal.pubKey.toString()}`}
          component={NextLink}
          underline="none"
        >
          <Stack direction="column" spacing={2}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Image
                  src={isTransfer ? LaunchIcon : SettingsActive}
                  alt="download-icon"
                  width={24}
                  height={24}
                />
                <Stack direction="row" spacing={1}>
                  <Typography sx={styles.titleTextStyle}>
                    {isTransfer ? "Send" : "Change policy"}
                  </Typography>
                  {isTransfer && token && (
                    <Typography sx={styles.valueTextStyle}>
                      {`${balance} ${token.symbol}`}
                    </Typography>
                  )}
                </Stack>
              </Stack>
              {generateStatus(proposal.proposalStage)}
            </Stack>
            <Stack direction="row" spacing={2}>
              <Typography sx={styles.titleTextStyle}>
                {proposal.name}
              </Typography>
              <Typography sx={styles.valueTextStyle}>
                {formatAddressDisplay(proposal.pubKey.toString(), 5)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Typography sx={styles.titleTextStyle}>Date:</Typography>
              <Typography sx={styles.valueTextStyle}>
                {generateDate(proposal.createdDate)}
              </Typography>
            </Stack>
          </Stack>
        </Link>
      </Box>
    );
  }

  return (
    <>
      <Link
        href={`/safe/${safeAddress}/transactions/${proposal.pubKey.toString()}`}
        component={NextLink}
        underline="none"
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={8}>
            <IconButton onClick={undefined}>
              <Image
                src={isTransfer ? LaunchIcon : SettingsActive}
                alt="download-icon"
                width={32}
                height={32}
              />
            </IconButton>
            <Stack direction="column" spacing={1}>
              <Typography sx={styles.titleTextStyle}>
                {proposal.name}
              </Typography>
              <Typography sx={styles.valueTextStyle}>
                {formatAddressDisplay(proposal.pubKey.toString(), 7)}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="column" spacing={1}>
            <Typography sx={styles.titleTextStyle}>
              {isTransfer ? "Send" : "Change policy"}
            </Typography>
            {isTransfer && token && (
              <Typography sx={styles.valueTextStyle}>
                {`${balance} ${token.symbol}`}
              </Typography>
            )}
          </Stack>
          {generateStatus(proposal.proposalStage)}
          <Typography sx={styles.valueTextStyle}>
            {generateDate(proposal.createdDate)}
          </Typography>
        </Stack>
      </Link>
      {!isLast && <Divider style={{ backgroundColor: "#FFFFFF3D" }} />}
    </>
  );
};

export default TransactionItem;

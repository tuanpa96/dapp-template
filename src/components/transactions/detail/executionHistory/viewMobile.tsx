import EmptyList from "@/components/shared/emptyList";
import Loading from "@/components/shared/loading";
import { getEndpointExplorerUrl } from "@/utils/constants";
import { formatAddressDisplay } from "@/utils/formatHelpers";
import { Box, Link, Stack, Typography } from "@mui/material";
import { useConnection } from "@renec-foundation/wallet-adapter-react";
import { ConfirmedSignatureInfo, PublicKey } from "@solana/web3.js";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import * as styles from "./styles";

export interface executionHistoryProps {
  reReload: number;
  transactionAddress: string;
}

const renderStatusColor = (status: any) => {
  switch (status) {
    case "processed":
      return "#00B894";
    case "confirmed":
      return "#F1C40F";
    case "finalized":
      return "#9B59B6";
  }
};

interface ExtendedSignatureInfo extends ConfirmedSignatureInfo {
  log: string;
}

const ExecutionHistoryMobile = ({
  reReload,
  transactionAddress,
}: executionHistoryProps) => {
  const { connection } = useConnection();
  const [histories, setHistories] = useState<ExtendedSignatureInfo[]>([]);
  const [loadingEnable, setLoadingEnable] = useState(false);

  useEffect(() => {
    const fetchExecutionHistory = async () => {
      setLoadingEnable(true);
      if (connection) {
        try {
          const his = await connection.getSignaturesForAddress(
            new PublicKey(transactionAddress)
          );
          const histories = his as ExtendedSignatureInfo[];

          await Promise.all(
            histories.map(async (h, index) => {
              const transaction = await connection.getTransaction(h.signature, {
                commitment: "confirmed",
              });
              const logs = transaction?.meta?.logMessages;
              const intructionLogs = logs?.find((log) =>
                log.includes("Instruction")
              );
              if (intructionLogs) {
                const instructionIndex = intructionLogs.indexOf("Instruction:");
                histories[index].log = intructionLogs
                  .substring(instructionIndex + 13)
                  .trim();
              }
            })
          );

          setLoadingEnable(false);
          setHistories(histories);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchExecutionHistory();
  }, [connection, transactionAddress, reReload]);

  return (
    <>
      {loadingEnable && (
        <Box sx={styles.flexCenterStyle}>
          <Loading />
        </Box>
      )}
      {!loadingEnable && histories.length <= 0 && (
        <EmptyList height={200} content="You don't have any transactions yet" />
      )}
      {!loadingEnable &&
        histories.length > 0 &&
        histories.map((history, index) => (
          <Stack
            direction="column"
            spacing={2}
            key={index}
            sx={styles.boxStyle}
          >
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="column" spacing={1} flex={1}>
                <Typography fontSize={14} fontWeight={600}>
                  Action
                </Typography>
                <Typography fontSize={14}>{history.log}</Typography>
              </Stack>
              <Stack direction="column" spacing={1} flex={1.3}>
                <Typography fontSize={14} fontWeight={600}>
                  Time
                </Typography>
                <Typography fontSize={14}>
                  {history.blockTime &&
                    new Date(history.blockTime * 1000).toLocaleString()}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="column" spacing={1} flex={1}>
                <Typography fontSize={14} fontWeight={600}>
                  Status
                </Typography>
                <Typography
                  sx={{
                    color: renderStatusColor(history.confirmationStatus),
                  }}
                  fontSize={14}
                  fontWeight={600}
                >
                  {history.confirmationStatus}
                </Typography>
              </Stack>
              <Stack direction="column" spacing={1} flex={1.3}>
                <Typography fontSize={14} fontWeight={600}>
                  Transaction Signature
                </Typography>
                <Link
                  href={getEndpointExplorerUrl(`tx/${history.signature}`)}
                  component={NextLink}
                  target="_blank"
                  onClick={(event) => event.stopPropagation()}
                >
                  {formatAddressDisplay(history.signature, 7)}
                </Link>
              </Stack>
            </Stack>
          </Stack>
        ))}
    </>
  );
};

export default ExecutionHistoryMobile;

import EmptyList from "@/components/shared/emptyList";
import Loading from "@/components/shared/loading";
import { getEndpointExplorerUrl } from "@/utils/constants";
import { formatAddressDisplay } from "@/utils/formatHelpers";
import {
  Box,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
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

const ExecutionHistory = ({
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
    <TableContainer sx={{ backgroundColor: "transparent" }} component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={styles.tableHeaderTextStyle}
              style={{ width: "30%" }}
            >
              Time
            </TableCell>
            <TableCell
              sx={styles.tableHeaderTextStyle}
              style={{ width: "25%" }}
            >
              Status
            </TableCell>
            <TableCell
              sx={styles.tableHeaderTextStyle}
              style={{ width: "45%" }}
            >
              Transaction Signature
            </TableCell>
            <TableCell
              sx={styles.tableHeaderTextStyle}
              style={{ width: "45%" }}
            >
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loadingEnable && (
            <TableRow sx={styles.tableRowStyle}>
              <TableCell colSpan={4}>
                <Box sx={styles.flexCenterStyle}>
                  <Loading />
                </Box>
              </TableCell>
            </TableRow>
          )}
          {!loadingEnable && histories.length <= 0 && (
            <TableRow sx={styles.tableRowStyle}>
              <TableCell colSpan={4}>
                <EmptyList
                  height={250}
                  content="You don't have any transactions yet"
                />
              </TableCell>
            </TableRow>
          )}
          {!loadingEnable &&
            histories.length > 0 &&
            histories.map((history, index) => (
              <TableRow key={index}>
                <TableCell sx={styles.tableBodyTextStyle}>
                  {history.blockTime &&
                    new Date(history.blockTime * 1000).toLocaleString()}
                </TableCell>
                <TableCell sx={styles.tableBodyTextStyle}>
                  <Typography
                    sx={{
                      color: renderStatusColor(history.confirmationStatus),
                    }}
                    fontSize={14}
                    fontWeight={600}
                  >
                    {history.confirmationStatus}
                  </Typography>
                </TableCell>
                <TableCell sx={styles.tableBodyTextStyle}>
                  <Link
                    href={getEndpointExplorerUrl(`tx/${history.signature}`)}
                    component={NextLink}
                    target="_blank"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {formatAddressDisplay(history.signature, 15)}
                  </Link>
                </TableCell>
                <TableCell sx={styles.tableBodyTextStyle}>
                  {history.log}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ExecutionHistory;

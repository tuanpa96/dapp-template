import Loading from "@/components/shared/loading";
import { useMultisigContext } from "@/components/shared/multisigProvider";
import { Box, Divider, Stack, Tab, Tabs, Typography } from "@mui/material";
import { MultisigJob, ProposalStateType } from "@renec-foundation/multisig-sdk";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { transactionsProps } from "./common";
import TransactionList from "./list";
import * as styles from "./styles";

const tabs = ["Queue", "In Execution", "History"];

const Transactions = ({ safeAddress }: transactionsProps) => {
  const [valueTab, setValueTab] = useState(0);
  const { safeClient } = useMultisigContext();
  const [queueProposals, setQueueProposals] = useState<MultisigJob[]>([]);
  const [inExecutionProposals, setInExecutionProposals] = useState<
    MultisigJob[]
  >([]);
  const [histories, setHistories] = useState<MultisigJob[]>([]);
  const [loadingEnable, setLoadingEnable] = useState(true);
  const [targetProposals, setTargetProposals] = useState<MultisigJob[]>([]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (safeClient) {
        const allProposals = await safeClient.fetchAllProposals(
          new PublicKey(safeAddress)
        );

        const queues: MultisigJob[] = [];
        const executions: MultisigJob[] = [];
        const his: MultisigJob[] = [];

        allProposals.forEach((pro) => {
          if (
            pro.proposalStage === ProposalStateType.Pending ||
            pro.proposalStage === ProposalStateType.Approved
          ) {
            queues.push(pro);
          } else if (
            pro.proposalStage === ProposalStateType.ExecutionInProgress
          ) {
            executions.push(pro);
          } else {
            his.push(pro);
          }
        });

        setQueueProposals(queues);
        setInExecutionProposals(executions);
        setHistories(his);
        setLoadingEnable(false);
      }
    };

    fetchProposals();
  }, [safeAddress, safeClient]);

  useEffect(() => {
    switch (valueTab) {
      case 0:
        setTargetProposals(queueProposals);
        break;
      case 1:
        setTargetProposals(inExecutionProposals);
        break;
      default:
        setTargetProposals(histories);
    }
  }, [valueTab, queueProposals, inExecutionProposals, histories]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValueTab(newValue);
  };

  const generateCount = (index: number) => {
    if (index === 0) {
      return queueProposals.length;
    } else if (index === 1) {
      return inExecutionProposals.length;
    } else {
      return histories.length;
    }
  };

  return (
    <Box sx={styles.main}>
      <Stack direction="column" spacing={3}>
        <Typography sx={styles.titleLabelStyle}>Transactions</Typography>
        <Box>
          <Tabs
            value={valueTab}
            variant="scrollable"
            onChange={handleChange}
            textColor="inherit"
            indicatorColor="primary"
            sx={{ overflow: "auto" }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                value={index}
                label={`${tab} (${generateCount(index)})`}
              />
            ))}
          </Tabs>
          <Divider style={{ backgroundColor: "#383B54" }} />
        </Box>
        <Stack direction="column" spacing={3} sx={{ overflow: "auto" }}>
          {loadingEnable ? (
            <Box sx={[styles.boxStyle, styles.flexCenterStyle]}>
              <Loading />
            </Box>
          ) : (
            <TransactionList
              safeAddress={safeAddress}
              proposals={targetProposals}
            />
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default Transactions;

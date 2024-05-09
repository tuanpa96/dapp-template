import AvatarIcon from "@/assets/icons/avatar.svg";
import { useMultisigContext } from "@/components/shared/multisigProvider";
import useLocalStorage from "@/hooks/useLocalStorage";
import { KEY_LIST_OWNER_SAFE } from "@/utils/constants";
import { formatAddressDisplay } from "@/utils/formatHelpers";
import { Check, Close, HourglassTop } from "@mui/icons-material";
import {
  Box,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import {
  MultisigJob,
  ProposalStateType,
  SafeType,
} from "@renec-foundation/multisig-sdk";
import { useWallet } from "@renec-foundation/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import moment from "moment";
import Image from "next/image";
import { useEffect, useState } from "react";
import IconStep from "./iconStep";
import * as styles from "./styles";

type itemActionProps = {
  address: string;
  nickName?: string;
  time: string;
  approved?: boolean;
  waitingApprove?: boolean;
  created?: boolean;
};

type transactionDetailProps = {
  proposal: MultisigJob;
  approvalsRequired: number;
  safeAddress: string;
};

const ItemAction = ({
  address,
  nickName,
  time,
  approved,
  waitingApprove,
  created,
}: itemActionProps) => (
  <Stack direction="column" spacing={1}>
    <Typography sx={styles.titleItemStyle}>{time}</Typography>
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Image src={AvatarIcon} alt="avatar-icon" width={24} height={24} />
        <Stack direction="column" spacing={1}>
          {nickName && (
            <Typography sx={styles.contentItemStyle}>{nickName}</Typography>
          )}
          <Typography sx={styles.contentItemStyle}>
            {formatAddressDisplay(address, 7)}
          </Typography>
        </Stack>
      </Stack>
      {!created && !waitingApprove && (
        <Box sx={styles.iconStepDoneStyle}>
          {approved ? (
            <Check fontSize="inherit" />
          ) : (
            <Close fontSize="inherit" color="error" />
          )}
        </Box>
      )}
      {!created && waitingApprove && (
        <Box sx={styles.iconStepDoneStyle}>
          <HourglassTop fontSize="inherit" color="warning" />
        </Box>
      )}
    </Stack>
  </Stack>
);

const StatusEvent = ({
  safeAddress,
  proposal,
  approvalsRequired,
}: transactionDetailProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [cacheListOwnerSafe] = useLocalStorage(KEY_LIST_OWNER_SAFE, {} as any);
  const [safe, setSafe] = useState<SafeType>();
  const { safeClient } = useMultisigContext();
  const { publicKey } = useWallet();

  useEffect(() => {
    const fetchSafe = async () => {
      if (safeClient) {
        try {
          const safeAddressPK = new PublicKey(safeAddress);
          const safe = await safeClient.fetcher.findSafe(safeAddressPK);
          setSafe(safe);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchSafe();
  }, [safeAddress, safeClient]);

  useEffect(() => {
    switch (proposal.proposalStage) {
      case ProposalStateType.Pending:
        setActiveStep(1);
        break;
      case ProposalStateType.Rejected:
        setActiveStep(1);
        break;
      case ProposalStateType.Approved:
        setActiveStep(1);
        break;
      case ProposalStateType.ExecutionInProgress:
        setActiveStep(3);
        break;
      case ProposalStateType.Complete:
        setActiveStep(4);
        break;
    }
  }, [proposal.proposalStage]);

  return (
    <Stack direction="column" spacing={3}>
      <Typography sx={styles.titleContentStyle}>Status</Typography>
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step active={true}>
          <StepLabel icon={<IconStep activeStep={activeStep} index={0} />}>
            <Typography sx={styles.contentTextStyle}>Create</Typography>
          </StepLabel>
          <StepContent>
            <ItemAction
              address={proposal.requestedBy.toString()}
              time={moment.unix(proposal.createdDate).fromNow()}
              nickName={cacheListOwnerSafe[proposal.requestedBy.toString()]}
              created
            />
          </StepContent>
        </Step>
        <Step active={true}>
          <StepLabel icon={<IconStep activeStep={activeStep} index={1} />}>
            <Typography sx={styles.contentTextStyle}>{`${
              proposal.proposalStage === ProposalStateType.Rejected
                ? "Rejected"
                : "Approved"
            } (${
              proposal.approvals.filter((approval) => approval.isApproved)
                .length
            }/${approvalsRequired})`}</Typography>
          </StepLabel>
          <StepContent>
            <Stack direction="column" spacing={2}>
              {proposal.approvals.map((approval, index) => (
                <ItemAction
                  key={index}
                  address={approval.owner.toString()}
                  time={moment.unix(approval.date).fromNow()}
                  nickName={cacheListOwnerSafe[approval.owner.toString()]}
                  approved={approval.isApproved}
                />
              ))}
              {proposal.proposalStage === ProposalStateType.Pending &&
                safe?.owners
                  .filter(
                    (owner) =>
                      !proposal.approvals.some(
                        (approval) =>
                          approval.owner.toString() === owner.toString()
                      )
                  )
                  .map((owner, index) => (
                    <ItemAction
                      key={index}
                      address={owner.toString()}
                      time={
                        owner.toString() === publicKey?.toString()
                          ? "Waiting for your approval"
                          : "Waiting for this owner's approval"
                      }
                      nickName={cacheListOwnerSafe[owner.toString()]}
                      waitingApprove
                    />
                  ))}
            </Stack>
          </StepContent>
        </Step>
        <Step active={true}>
          <StepLabel icon={<IconStep activeStep={activeStep} index={2} />}>
            <Typography sx={styles.contentTextStyle}>
              Execution In Progress
            </Typography>
          </StepLabel>
        </Step>
        <Step active={true}>
          <StepLabel icon={<IconStep activeStep={activeStep} index={3} />}>
            <Typography sx={styles.contentTextStyle}>
              Execution successfully
            </Typography>
          </StepLabel>
        </Step>
      </Stepper>
    </Stack>
  );
};

export default StatusEvent;

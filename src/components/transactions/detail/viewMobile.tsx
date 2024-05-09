import ActionSendIcon from "@/assets/icons/action_send.svg";
import MinimizeIcon from "@/assets/icons/minimize.svg";
import RefreshIcon from "@/assets/icons/refresh.svg";
import Loading from "@/components/shared/loading";
import useLocalStorage from "@/hooks/useLocalStorage";
import { KEY_LIST_CONTACT_SAFE } from "@/utils/constants";
import { formatAddressDisplay } from "@/utils/formatHelpers";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { MultisigJob } from "@renec-foundation/multisig-sdk";
import Image from "next/image";
import { ExecutionHistoryMobile } from "./executionHistory";
import StatusEvent from "./statusEvent";
import * as styles from "./styles";

export interface transactionDetailBodyProps {
  proposal: MultisigJob;
  showDelete: boolean;
  loadingAction: boolean;
  showReject: boolean;
  showApproval: boolean;
  showExecuted: boolean;
  isAddOwnerAction: boolean;
  isRemoveOwnerAction: boolean;
  balance: number;
  approvalsRequired: number;
  addressReceiver: string;
  token: any;
  reReload: number;
  safeAddress: string;
  transactionAddress: string;
  handleClickDelete: () => void;
  handleClickApproval: () => void;
  handleClickExecute: () => void;
  setOpenNewContactModal: (flag: boolean) => void;
  setReReload: (times: number) => void;
}

const ViewMobile = ({
  proposal,
  showDelete,
  loadingAction,
  showReject,
  showApproval,
  showExecuted,
  isAddOwnerAction,
  isRemoveOwnerAction,
  balance,
  approvalsRequired,
  addressReceiver,
  token,
  reReload,
  safeAddress,
  transactionAddress,
  handleClickDelete,
  handleClickApproval,
  handleClickExecute,
  setOpenNewContactModal,
  setReReload,
}: transactionDetailBodyProps) => {
  const [cacheListContactSafe] = useLocalStorage(
    KEY_LIST_CONTACT_SAFE,
    {} as any
  );

  return (
    <Stack direction="column" spacing={3}>
      <Typography sx={styles.titleLabelStyle}>{proposal.name}</Typography>
      <Stack direction="row" spacing={2}>
        {showDelete && (
          <Button
            variant="outlined"
            sx={[styles.btnCancelStyle, { flex: 1 }]}
            onClick={handleClickDelete}
            disabled={loadingAction}
          >
            {loadingAction && <Loading />}
            {!loadingAction && (
              <Typography sx={styles.deleteTextStyle}>Delete</Typography>
            )}
          </Button>
        )}
        {showReject && (
          <Button
            variant="outlined"
            sx={[styles.btnStyle, { flex: 1 }]}
            onClick={handleClickDelete}
            disabled={loadingAction}
          >
            {loadingAction && <Loading />}
            {!loadingAction && (
              <Typography sx={styles.textBtnStyle}>Reject</Typography>
            )}
          </Button>
        )}
        {showApproval && (
          <Button
            variant="contained"
            sx={[styles.btnStyle, { flex: 1 }]}
            onClick={handleClickApproval}
            disabled={loadingAction}
          >
            {loadingAction && <Loading />}
            {!loadingAction && (
              <Typography sx={styles.textBtnStyle}>Approval</Typography>
            )}
          </Button>
        )}
        {showExecuted && (
          <Button
            variant="contained"
            sx={[styles.btnStyle, { flex: 1 }]}
            onClick={handleClickExecute}
            disabled={loadingAction}
          >
            {loadingAction && <Loading />}
            {!loadingAction && (
              <Typography sx={styles.textBtnStyle}>Execute</Typography>
            )}
          </Button>
        )}
      </Stack>
      <Stack direction="column" spacing={3}>
        <Stack
          direction="column"
          spacing={3}
          sx={{ width: "-webkit-fill-available" }}
        >
          <Stack direction="row" spacing={2}>
            <Image
              src={MinimizeIcon}
              alt="minimize-icon"
              width={24}
              height={24}
            />
            <Typography sx={styles.titleContentStyle}>Action</Typography>
          </Stack>
          <Typography sx={styles.contentTextStyle}>Action type:</Typography>
          <Box sx={styles.boxFieldStyle}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Image
                src={ActionSendIcon}
                alt="minimize-icon"
                width={24}
                height={24}
              />
              <Typography sx={{ color: "#888C9E" }}>
                {isAddOwnerAction
                  ? "Add Owner Action"
                  : isRemoveOwnerAction
                  ? "Remove Owner Action"
                  : "Send Action"}
              </Typography>
            </Stack>
          </Box>
          <Divider style={{ backgroundColor: "#FFFFFF3D" }} />
          {!isAddOwnerAction && !isRemoveOwnerAction && (
            <>
              <Stack direction="column" spacing={2}>
                <Typography sx={styles.contentTextStyle}>Amount:</Typography>
                <Stack direction="row" spacing={2}>
                  <Box sx={[styles.boxFieldStyle, { flex: 1 }]}>
                    <Typography sx={{ color: "#888C9E" }}>{balance}</Typography>
                  </Box>
                  {token && (
                    <Stack
                      flex={1}
                      direction="row"
                      spacing={2}
                      sx={styles.boxFieldStyle}
                    >
                      <Image
                        src={token.logoURI}
                        alt="minimize-icon"
                        width={24}
                        height={24}
                      />
                      <Typography sx={{ color: "#888C9E" }}>
                        {token.symbol}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>

              <Stack direction="column" spacing={2}>
                <Typography sx={styles.contentTextStyle}>Send to:</Typography>
                <Box flex={1} sx={styles.boxFieldStyle}>
                  <Typography sx={{ color: "#888C9E" }}>
                    {formatAddressDisplay(addressReceiver, 13)}
                  </Typography>
                </Box>
                {!cacheListContactSafe[addressReceiver] && (
                  <Box>
                    <Button
                      variant="outlined"
                      sx={styles.btnAddContactStyle}
                      onClick={() => {
                        setOpenNewContactModal(true);
                      }}
                    >
                      <Typography sx={styles.deleteTextStyle}>
                        Add contact
                      </Typography>
                    </Button>
                  </Box>
                )}
              </Stack>
              <Stack direction="row" spacing={2}>
                {cacheListContactSafe[addressReceiver] && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography
                      sx={{
                        color: "#888C9E",
                      }}
                    >
                      Contact: {cacheListContactSafe[addressReceiver]}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </>
          )}

          <Stack flexDirection={"row"} justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Image
                src={MinimizeIcon}
                alt="minimize-icon"
                width={24}
                height={24}
              />
              <Typography sx={styles.titleContentStyle}>
                Execution History
              </Typography>
            </Stack>
            <Image
              src={RefreshIcon}
              alt="refresh"
              width={24}
              height={24}
              onClick={() => setReReload(reReload + 1)}
            />
          </Stack>
          <ExecutionHistoryMobile
            reReload={reReload}
            transactionAddress={transactionAddress}
          />
        </Stack>
        <Box flex={1} sx={styles.boxStatusStyle}>
          <StatusEvent
            safeAddress={safeAddress}
            proposal={proposal}
            approvalsRequired={approvalsRequired}
          />
        </Box>
      </Stack>
    </Stack>
  );
};

export default ViewMobile;

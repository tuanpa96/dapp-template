import RenecIcon from "@/assets/icons/renec.svg";
import AddNewContactModal from "@/components/addNewContactModal";
import Loading from "@/components/shared/loading";
import { useMultisigContext } from "@/components/shared/multisigProvider";
import useIsMobile from "@/hooks/useMobileDetection";
import { IS_MAINNET, TOKEN_PROGRAM_ID } from "@/utils/constants";
import { Alert, Box } from "@mui/material";
import { MultisigJob, ProposalStateType } from "@renec-foundation/multisig-sdk";
import {
  ENV,
  TokenInfo,
  TokenListProvider,
} from "@renec-foundation/rpl-token-registry";
import {
  useConnection,
  useWallet,
} from "@renec-foundation/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
  SystemInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { useEffect, useState } from "react";
import * as styles from "./styles";
import ViewMobile from "./viewMobile";
import ViewPC from "./viewPC";

export interface transactionDetailProps {
  safeAddress: string;
  transactionAddress: string;
}

const TransactionDetail = ({
  safeAddress,
  transactionAddress,
}: transactionDetailProps) => {
  const { publicKey } = useWallet();
  const { safeClient } = useMultisigContext();
  const { connection } = useConnection();
  const [proposal, setProposal] = useState<MultisigJob | undefined>();
  const [balance, setBalance] = useState<number>(0);
  const [addressReceiver, setAddressReceiver] = useState<string>("");
  const [loadingEnable, setLoadingEnable] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [showExecuted, setShowExecuted] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reReload, setReReload] = useState(0);
  const [submitError, setSubmitError] = useState<any>(null);
  const [approvalsRequired, setApprovalsRequired] = useState(0);
  const [isOpenNewContactModal, setOpenNewContactModal] =
    useState<boolean>(false);
  const [isAddOwnerAction, setIsAddOwnerAction] = useState(false);
  const [isRemoveOwnerAction, setIsRemoveOwnerAction] = useState(false);
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
  const [token, setToken] = useState<any>({
    symbol: "RENEC",
    logoURI: RenecIcon,
  });
  const isMobile = useIsMobile();

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
    const fetchProposal = async () => {
      if (safeClient && tokenMap) {
        try {
          setShowApproval(false);
          setShowExecuted(false);
          const safe = await safeClient.fetcher.findSafe(
            new PublicKey(safeAddress)
          );
          const getProposal = await safeClient.fetchProposal(
            new PublicKey(transactionAddress)
          );

          const canManager = safe.owners.find(
            (o) => o.toString() === publicKey?.toString()
          );
          const approved = getProposal.approvals.find(
            (approval) => approval.owner.toString() === publicKey?.toString()
          );

          setShowDelete(
            getProposal.proposalStage === ProposalStateType.Pending &&
              getProposal.approvals.length === 0
          );
          setShowReject(
            getProposal.proposalStage === ProposalStateType.Pending &&
              getProposal.approvals.length !== 0 &&
              !approved &&
              !!canManager
          );
          const instructionTokenTransfer = getProposal.instructions.find(
            (instruction) => {
              const programId = instruction.programId.toBase58();
              return (
                programId === TOKEN_PROGRAM_ID.toBase58() &&
                instruction.data[0] === 3
              );
            }
          );
          if (instructionTokenTransfer) {
            setBalance(
              Number(instructionTokenTransfer.data.readBigUInt64LE(1)) /
                LAMPORTS_PER_SOL
            );
            const tokenAccountInfo = await connection.getAccountInfo(
              instructionTokenTransfer.keys[1].pubkey
            );
            if (tokenAccountInfo?.owner.equals(TOKEN_PROGRAM_ID)) {
              const ownerPublicKey = new PublicKey(
                tokenAccountInfo?.data.slice(32, 64)
              );
              setAddressReceiver(ownerPublicKey.toString());
              const mintPublicKey = new PublicKey(
                tokenAccountInfo?.data.slice(0, 32)
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
                  // Extract the decimals value from the token account data
                  tokenDecimals = (
                    tokenAccountInfo.value.data as ParsedAccountData
                  ).parsed.info.decimals;
                }
              }
              if (tokenDecimals > 0) {
                setBalance(
                  Number(instructionTokenTransfer.data.readBigUInt64LE(1)) /
                    LAMPORTS_PER_SOL
                );
              } else {
                setBalance(
                  Number(instructionTokenTransfer.data.readBigUInt64LE(1))
                );
              }
            } else {
              // There are 2 instruction and one of these is create token account instruction

              const instructionCreateTokenAccount =
                getProposal.instructions.find((instruction) => {
                  return instruction.data[0] !== 3;
                });

              if (instructionCreateTokenAccount) {
                const ownerPublicKey = new PublicKey(
                  instructionCreateTokenAccount.keys[2].pubkey
                );
                setAddressReceiver(ownerPublicKey.toString());
                const mintPublicKey = new PublicKey(
                  instructionCreateTokenAccount.keys[3].pubkey
                );
                setToken(tokenMap.get(mintPublicKey.toBase58()));

                const tokenAddress = tokenMap.get(
                  mintPublicKey.toBase58()
                )?.address;
                let tokenDecimals = 9;

                if (tokenAddress) {
                  const tokenAccountInfo =
                    await connection.getParsedAccountInfo(
                      new PublicKey(tokenAddress)
                    );

                  if (tokenAccountInfo?.value) {
                    // Extract the decimals value from the token account data
                    tokenDecimals = (
                      tokenAccountInfo.value.data as ParsedAccountData
                    ).parsed.info.decimals;
                  }
                }
                if (tokenDecimals > 0) {
                  setBalance(
                    Number(instructionTokenTransfer.data.readBigUInt64LE(1)) /
                      LAMPORTS_PER_SOL
                  );
                } else {
                  setBalance(
                    Number(instructionTokenTransfer.data.readBigUInt64LE(1))
                  );
                }
              }
            }
          }
          const instructionTransfer = getProposal.instructions.find(
            (instruction) => {
              const programId = instruction.programId.toBase58();
              return (
                programId === SystemProgram.programId.toBase58() &&
                SystemInstruction.decodeInstructionType(instruction) ===
                  "Transfer"
              );
            }
          );
          if (instructionTransfer) {
            const instructionDecode =
              SystemInstruction.decodeTransfer(instructionTransfer);
            setBalance(Number(instructionDecode.lamports) / LAMPORTS_PER_SOL);
            setAddressReceiver(instructionDecode.toPubkey.toString());
          }
          if (
            canManager &&
            getProposal.proposalStage === ProposalStateType.Pending &&
            !approved
          ) {
            setShowApproval(true);
          }
          if (
            canManager &&
            getProposal.proposalStage === ProposalStateType.Approved
          ) {
            setShowExecuted(true);
          }
          setApprovalsRequired(safe.approvalsRequired);
          setProposal(getProposal);
          setLoadingEnable(false);
          setIsAddOwnerAction(getProposal.name === "addOwner");
          setIsRemoveOwnerAction(getProposal.name === "removeOwner");
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchProposal();
  }, [
    publicKey,
    safeAddress,
    safeClient,
    transactionAddress,
    reReload,
    connection,
    tokenMap,
  ]);

  const handleClickDelete = async () => {
    if (safeClient && proposal) {
      try {
        setLoadingAction(true);
        const rejectTx = await safeClient.rejectProposal(proposal?.pubKey);
        await rejectTx.buildAndExecute();

        setLoadingAction(false);
        setReReload(reReload + 1);
      } catch (error) {
        console.error(error);
        setSubmitError(error);
        setLoadingAction(false);
      }
    }
  };

  const handleClickApproval = async () => {
    if (safeClient && proposal) {
      try {
        setLoadingAction(true);
        const transaction = await safeClient.approveProposal(proposal.pubKey);
        await transaction.buildAndExecute();

        setLoadingAction(false);
        setReReload(reReload + 1);
      } catch (error) {
        console.error(error);
        setSubmitError(error);
        setLoadingAction(false);
      }
    }
  };

  const handleClickExecute = async () => {
    if (safeClient && proposal) {
      try {
        setLoadingAction(true);
        const executeTx = await safeClient.executeProposal(proposal.pubKey);
        await executeTx.buildAndExecute();

        setLoadingAction(false);
        setReReload(reReload + 1);
      } catch (error) {
        console.error(error);
        setSubmitError(error);
        setLoadingAction(false);
      }
    }
  };

  return (
    <Box sx={styles.main}>
      {submitError && (
        <Alert variant="filled" severity="error" sx={{ mb: 4 }}>
          {submitError.toString()}
        </Alert>
      )}
      {loadingEnable && (
        <Box sx={[styles.boxStyle, styles.flexCenterStyle]}>
          <Loading />
        </Box>
      )}
      {!loadingEnable && proposal && isMobile && (
        <ViewMobile
          proposal={proposal}
          showDelete={showDelete}
          loadingAction={loadingAction}
          showReject={showReject}
          showApproval={showApproval}
          showExecuted={showExecuted}
          isAddOwnerAction={isAddOwnerAction}
          isRemoveOwnerAction={isRemoveOwnerAction}
          balance={balance}
          approvalsRequired={approvalsRequired}
          addressReceiver={addressReceiver}
          token={token}
          reReload={reReload}
          safeAddress={safeAddress}
          transactionAddress={transactionAddress}
          handleClickDelete={handleClickDelete}
          handleClickApproval={handleClickApproval}
          handleClickExecute={handleClickExecute}
          setOpenNewContactModal={setOpenNewContactModal}
          setReReload={setReReload}
        />
      )}
      {!loadingEnable && proposal && !isMobile && (
        <ViewPC
          proposal={proposal}
          showDelete={showDelete}
          loadingAction={loadingAction}
          showReject={showReject}
          showApproval={showApproval}
          showExecuted={showExecuted}
          isAddOwnerAction={isAddOwnerAction}
          isRemoveOwnerAction={isRemoveOwnerAction}
          balance={balance}
          approvalsRequired={approvalsRequired}
          addressReceiver={addressReceiver}
          token={token}
          reReload={reReload}
          safeAddress={safeAddress}
          transactionAddress={transactionAddress}
          handleClickDelete={handleClickDelete}
          handleClickApproval={handleClickApproval}
          handleClickExecute={handleClickExecute}
          setOpenNewContactModal={setOpenNewContactModal}
          setReReload={setReReload}
        />
      )}
      <AddNewContactModal
        contactAddress={addressReceiver}
        isOpen={isOpenNewContactModal}
        setOpenModal={setOpenNewContactModal}
      />
    </Box>
  );
};

export default TransactionDetail;

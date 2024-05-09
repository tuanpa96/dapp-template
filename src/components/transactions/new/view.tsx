import InfoCircleIcon from "@/assets/icons/info_circle.svg";
import MinimizeIcon from "@/assets/icons/minimize.svg";
import AddNewContactModal from "@/components/addNewContactModal";
import Loading from "@/components/shared/loading";
import { useMultisigContext } from "@/components/shared/multisigProvider";
import useLocalStorage from "@/hooks/useLocalStorage";
import useIsMobile from "@/hooks/useMobileDetection";
import useTokenBalances from "@/hooks/useTokenBalances";
import {
  KEY_LIST_CONTACT_SAFE,
  LIST_ACTIONS,
  LIST_TOKENS,
  TOKEN_PROGRAM_ID,
} from "@/utils/constants";
import { addressValid } from "@/utils/verifyCoreChange";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  useConnection,
  useWallet,
} from "@renec-foundation/wallet-adapter-react";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import {
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import * as styles from "./styles";

interface transactionsProps {
  safeAddress: string;
}

const TransactionNew = ({ safeAddress }: transactionsProps) => {
  const { connection } = useConnection();
  const { safeClient } = useMultisigContext();
  const { publicKey } = useWallet();
  const isMobile = useIsMobile();

  const [transactionName, setTransactionName] = useState("Send fund from safe");
  const [amount, setAmount] = useState<any>("");
  const [addressReceiver, setAddressReceiver] = useState<string>("");
  const [action, setAction] = useState(LIST_ACTIONS[0]);
  const [token, setToken] = useState<any>(LIST_TOKENS[0]);
  const [balance, setBalance] = useState(0);
  const [signer, setSigner] = useState<string>("");
  const [loadingEnable, setLoadingEnable] = useState(true);
  const [submit, setSubmit] = useState(false);
  const [submitError, setSubmitError] = useState<any>(null);

  const [errorName, setErrorName] = useState("");
  const [errorAmount, setErrorAmount] = useState("");
  const [errorAddress, setErrorAddress] = useState("");
  const [showBtnAddContact, setShowBtnAddContact] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [isOpenNewContactModal, setOpenNewContactModal] =
    useState<boolean>(false);

  const router = useRouter();
  const { tokenList, renecBalance } = useTokenBalances(safeAddress);

  const [cacheListContactSafe] = useLocalStorage(
    KEY_LIST_CONTACT_SAFE,
    {} as any
  );

  const handleSelectActionChain = (event: SelectChangeEvent) => {
    const actionSelected =
      LIST_ACTIONS.find(
        (action) => action.actionName === (event.target.value as string)
      ) || LIST_ACTIONS[0];

    setAction(actionSelected);
  };

  const handleSelectTokenChain = (event: SelectChangeEvent) => {
    let tokenSelected = LIST_TOKENS.find(
      (token) => token.info.symbol === (event.target.value as string)
    );

    if (tokenSelected) {
      setBalance(renecBalance);
      setToken(tokenSelected);
      return;
    }

    tokenSelected =
      tokenList.find(
        (token: any) => token.info.symbol === (event.target.value as string)
      ) || LIST_TOKENS[0];

    if (tokenSelected) {
      setBalance(tokenSelected.balance);
      setToken(tokenSelected);
    }
  };

  const handleInputTransactionName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newName = event.target.value as string;
    if (newName) {
      setErrorName("");
    } else {
      setErrorName("Transaction name must exist");
    }

    setTransactionName(newName);
  };

  const handleInputAddressReceiver = (event: any, selectedOption: any) => {
    const newAddress =
      event.target.value || selectedOption?.value || selectedOption;

    if (!newAddress) {
      setErrorAddress("Address receiver name must exist");
      setShowBtnAddContact(false);
    } else if (!addressValid(newAddress)) {
      setErrorAddress("Address receiver invalid");
      setShowBtnAddContact(false);
    } else if (cacheListContactSafe[newAddress]) {
      setErrorAddress("");
      setShowBtnAddContact(false);
    } else {
      setErrorAddress("");
      setShowBtnAddContact(true);
    }

    setAddressReceiver(newAddress);
  };

  const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = Number(event.target.value);
    if (newNumber > 0 && newNumber <= balance) {
      setErrorAmount("");
    } else {
      setErrorAmount(
        `Amount needs to be greater than 0 and less than ${balance}`
      );
    }

    if (event.target.value) {
      setAmount(Number(newNumber));
    } else {
      setAmount("");
    }
  };

  const handleMaxAmount = () => {
    setErrorAmount("");
    setAmount(balance);
  };

  const verifyDataInfo = () => {
    const checkTransactionName = transactionName;
    const checkAmount = amount;
    const checkAddressReceiver = addressValid(addressReceiver);

    if (!checkTransactionName) {
      setErrorName("Transaction name must exist");
    }

    if (!checkAmount) {
      setErrorAmount("Amount needs to be greater than 0 and less than 999");
    }

    if (!checkAddressReceiver) {
      setErrorAddress("Address receiver invalid");
    }

    return checkTransactionName && checkAmount && checkAddressReceiver;
  };

  const handleCancel = () => {
    router.push(`/safe/${safeAddress}/transactions`);
  };

  const buildTokenTransferInstruction = async (
    receiverWalletAddress: string,
    tokenAddress: string,
    amountToSend: number,
    decimals: number
  ) => {
    const ixs: TransactionInstruction[] = [];

    const tokenMintAddress = new PublicKey(tokenAddress);
    const receiverPublicKey = new PublicKey(receiverWalletAddress);
    const programId = new PublicKey(TOKEN_PROGRAM_ID);
    const payer = new PublicKey(signer);

    const associatedDestinationTokenAddr =
      await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        programId,
        tokenMintAddress,
        receiverPublicKey,
        true
      );

    const associatedSourceTokenAddr = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      programId,
      tokenMintAddress,
      payer,
      true
    );

    const receiverAccount = await connection.getAccountInfo(
      associatedDestinationTokenAddr
    );

    if (receiverAccount === null) {
      ixs.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          programId,
          tokenMintAddress,
          associatedDestinationTokenAddr,
          receiverPublicKey,
          payer
        )
      );
    }

    ixs.push(
      Token.createTransferInstruction(
        programId,
        associatedSourceTokenAddr,
        associatedDestinationTokenAddr,
        payer,
        [],
        Number(amountToSend) * Math.pow(10, decimals)
      )
    );

    return ixs;
  };

  const handleSubmit = async () => {
    if (verifyDataInfo() && safeClient) {
      try {
        setSubmit(true);

        if (token.info.symbol === "RENEC") {
          const transferIx = SystemProgram.transfer({
            fromPubkey: new PublicKey(signer),
            toPubkey: new PublicKey(addressReceiver),
            lamports: (amount || 0) * LAMPORTS_PER_SOL,
          });

          const [proposalAddress, transaction] =
            await safeClient.createProposal(
              new PublicKey(safeAddress),
              transactionName,
              [transferIx]
            );

          await transaction.buildAndExecute();

          router.push(
            `/safe/${safeAddress}/transactions/${proposalAddress.toString()}`
          );
        } else {
          const tokenAccountInfo = await connection.getParsedAccountInfo(
            new PublicKey(token.info.address)
          );

          let tokenDecimals = 9;

          if (tokenAccountInfo?.value) {
            // Extract the decimals value from the token account data
            tokenDecimals = (tokenAccountInfo.value.data as ParsedAccountData)
              .parsed.info.decimals;
          }

          const transferIxs = await buildTokenTransferInstruction(
            addressReceiver,
            token.info.address,
            amount,
            tokenDecimals
          );

          const [proposalAddress, transaction] =
            await safeClient.createProposal(
              new PublicKey(safeAddress),
              transactionName,
              transferIxs
            );

          await transaction.buildAndExecute();

          router.push(
            `/safe/${safeAddress}/transactions/${proposalAddress.toString()}`
          );
        }
      } catch (error) {
        setSubmit(false);
        setSubmitError(error);
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const fetchSafeSigner = async () => {
      if (safeClient && publicKey) {
        const safe = await safeClient.fetcher.findSafe(
          new PublicKey(safeAddress)
        );

        const [safeSigner] = await safeClient.findSafeSignerAddress(
          new PublicKey(safeAddress)
        );

        if (safeSigner) {
          const value = await connection.getBalance(safeSigner);
          setSigner(safeSigner.toString());
          setBalance(value / LAMPORTS_PER_SOL);
        }

        setCanManage(
          !!safe.owners.find((o) => o.toString() === publicKey.toString())
        );

        setLoadingEnable(false);
      }
    };

    fetchSafeSigner();
  }, [connection, publicKey, safeAddress, safeClient]);

  return (
    <Box sx={styles.main}>
      {submitError && (
        <Alert variant="filled" severity="error" sx={{ mb: 4 }}>
          {submitError.toString()}
        </Alert>
      )}
      <Stack direction="column" spacing={5}>
        <Typography sx={styles.titleLabelStyle}>New Transaction</Typography>
        <Stack direction="column" spacing={2} sx={styles.boxStyle}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Image
              src={InfoCircleIcon}
              alt="info-icon"
              width={isMobile ? 24 : 32}
              height={isMobile ? 24 : 32}
            />
            <Typography sx={styles.titleContentStyle}>Info</Typography>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Typography flex={1} sx={[styles.contentTextStyle, { pt: 1 }]}>
              Name:
            </Typography>
            <Stack direction="column" spacing={2} flex={7}>
              <TextField
                data-test-id="step-info-input-name"
                placeholder={"Enter transaction name"}
                value={transactionName}
                onChange={handleInputTransactionName}
                InputProps={{
                  style: {
                    ...styles.fieldNameInputStyle,
                    fontSize: isMobile ? 14 : 16,
                  },
                }}
                autoComplete="off"
                error={Boolean(errorName)}
              />
              {Boolean(errorName) && (
                <Typography sx={styles.errorTextStyle}>{errorName}</Typography>
              )}
              <Typography sx={styles.contentSmallTextStyle}>
                Transaction name is stored on-chain. Please choose a generic
                name
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack direction="column" spacing={2} sx={styles.boxStyle}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Image
              src={MinimizeIcon}
              alt="minimize-icon"
              width={isMobile ? 24 : 32}
              height={isMobile ? 24 : 32}
            />
            <Typography sx={styles.titleContentStyle}>Action</Typography>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "unset", sm: "center" }}
            spacing={2}
          >
            <Typography flex={1} sx={[styles.contentTextStyle, { pt: 1 }]}>
              Action Type:
            </Typography>
            <Select
              value={action.actionName}
              onChange={handleSelectActionChain}
              sx={[styles.elementBorderStyle, { flex: 7 }]}
              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: "#e6e6e6",
                  },
                },
              }}
            >
              {LIST_ACTIONS.map((action, index) => {
                return (
                  <MenuItem key={index} value={action.actionName}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Image
                        src={action.icon}
                        alt="minimize-icon"
                        width={isMobile ? 24 : 32}
                        height={isMobile ? 24 : 32}
                      />
                      <Typography sx={{ color: "#888C9E" }}>
                        {action.actionName}
                      </Typography>
                    </Stack>
                  </MenuItem>
                );
              })}
            </Select>
          </Stack>
          <Box sx={{ py: { xs: 2, sm: 4 } }}>
            <Divider style={{ backgroundColor: "#FFFFFF3D" }} />
          </Box>
          <Stack direction="column" spacing={4}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Typography flex={1} sx={[styles.contentTextStyle]}>
                Amount:
              </Typography>
              <Box flex={7}>
                <Stack direction="column" spacing={2}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={4}
                  >
                    <TextField
                      data-test-id="detail-input-locking"
                      placeholder="Fill amount"
                      value={amount}
                      onChange={handleChangeAmount}
                      type="number"
                      sx={[styles.numberInputStyle, { flex: 3 }]}
                      InputProps={{
                        style: {
                          ...styles.fieldInputStyle,
                          fontSize: isMobile ? 15 : 16,
                        },
                      }}
                      autoComplete="off"
                      error={Boolean(errorAmount)}
                    />
                    <Select
                      value={token.info.symbol}
                      onChange={handleSelectTokenChain}
                      sx={[styles.elementBorderStyle, { flex: 1 }]}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            backgroundColor: "#e6e6e6",
                          },
                        },
                      }}
                    >
                      {LIST_TOKENS.map((token, index) => {
                        return (
                          <MenuItem key={index} value={token.info.symbol}>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Image
                                src={token.info.icon}
                                alt="minimize-icon"
                                width={isMobile ? 20 : 24}
                                height={isMobile ? 20 : 24}
                              />
                              <Typography
                                sx={{
                                  color: "#888C9E",
                                  fontSize: { xs: 14, md: 16 },
                                }}
                              >
                                {token.info.symbol}
                              </Typography>
                            </Stack>
                          </MenuItem>
                        );
                      })}
                      {tokenList &&
                        tokenList.map((token: any) => {
                          return (
                            token.info && (
                              <MenuItem
                                key={token.info.address}
                                value={token.info.symbol}
                              >
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  alignItems="center"
                                >
                                  <Image
                                    src={token.info.logoURI}
                                    alt="minimize-icon"
                                    width={isMobile ? 20 : 24}
                                    height={isMobile ? 20 : 24}
                                  />
                                  <Typography
                                    sx={{
                                      color: "#888C9E",
                                      fontSize: { xs: 14, md: 16 },
                                    }}
                                  >
                                    {token.info.symbol}
                                  </Typography>
                                </Stack>
                              </MenuItem>
                            )
                          );
                        })}
                    </Select>
                  </Stack>
                  {Boolean(errorAmount) && (
                    <Typography sx={styles.errorTextStyle}>
                      {errorAmount}
                    </Typography>
                  )}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={4}
                  >
                    <Typography
                      onClick={handleMaxAmount}
                      sx={[
                        styles.contentMaxTextStyle,
                        { flex: { xs: 1, sm: 3 } },
                      ]}
                    >
                      Max Amount
                    </Typography>
                    <Typography
                      sx={[styles.contentSmallTextStyle, { flex: 1 }]}
                    >
                      {loadingEnable && <Loading />}
                      {!loadingEnable && `Safe balance: ${balance}`}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Typography flex={1} sx={[styles.contentTextStyle, { pt: 1 }]}>
                Send to:
              </Typography>
              <Stack direction="column" spacing={2} flex={7}>
                <Box display={"flex"} justifyContent={"center"} flex={1}>
                  <Autocomplete
                    disablePortal
                    options={Object.entries(cacheListContactSafe).map(
                      ([key, value]) => ({
                        label: `${value} : ${key}`,
                        value: key,
                      })
                    )}
                    sx={styles.fieldAutocompleteStyle}
                    freeSolo
                    onChange={handleInputAddressReceiver}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        data-test-id="step-info-input-name"
                        placeholder="Enter address"
                        value={addressReceiver}
                        onChange={(e) => handleInputAddressReceiver(e, null)}
                        autoComplete="off"
                        error={Boolean(errorAddress)}
                        InputProps={{ style: styles.fieldInputStyle }}
                      />
                    )}
                  />
                  {showBtnAddContact && (
                    <Button
                      variant="outlined"
                      sx={styles.btnAddContactStyle}
                      onClick={() => {
                        setOpenNewContactModal(true);
                      }}
                    >
                      <Typography sx={styles.cancelTextStyle}>
                        Add contact
                      </Typography>
                    </Button>
                  )}
                </Box>
                {Boolean(errorAddress) && (
                  <Typography sx={styles.errorTextStyle}>
                    {errorAddress}
                  </Typography>
                )}
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
            </Stack>
          </Stack>
        </Stack>
        {canManage && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              sx={
                isMobile
                  ? [styles.btnCancelStyle, { flex: 1 }]
                  : [styles.btnCancelStyle]
              }
              onClick={handleCancel}
              disabled={submit}
            >
              <Typography sx={styles.cancelTextStyle}>Cancel</Typography>
            </Button>
            <Button
              variant="contained"
              sx={isMobile ? [styles.btnStyle, { flex: 1 }] : [styles.btnStyle]}
              onClick={handleSubmit}
              disabled={submit}
            >
              {submit && <Loading />}
              {!submit && (
                <Typography sx={styles.textBtnStyle}>Submit</Typography>
              )}
            </Button>
          </Stack>
        )}
      </Stack>
      <AddNewContactModal
        contactAddress={addressReceiver}
        isOpen={isOpenNewContactModal}
        setOpenModal={setOpenNewContactModal}
      />
    </Box>
  );
};

export default TransactionNew;

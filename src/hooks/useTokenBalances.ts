import { useMultisigContext } from "@/components/shared/multisigProvider";
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
} from "@solana/web3.js";
import { useEffect, useState } from "react";
import { IS_MAINNET, TOKEN_PROGRAM_ID } from "../utils/constants";

const useTokenBalances = (safeAddress: string) => {
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
  const [tokenList, setTokenList] = useState<any>([]);
  const [safeSignerAddress, setSafeSignerAddress] = useState("");
  const { safeClient } = useMultisigContext();
  const { connection } = useConnection();
  const [renecBalance, setRenecBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSafeSigner = async () => {
    setLoading(true);

    if (safeClient && safeAddress) {
      const [safeSigner] = await safeClient.findSafeSignerAddress(
        new PublicKey(safeAddress)
      );

      if (safeSigner) {
        const value = await connection.getBalance(safeSigner);
        setRenecBalance(value / LAMPORTS_PER_SOL);
      }

      setSafeSignerAddress(safeSigner.toString());
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSafeSigner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, safeAddress, safeClient]);

  const getTokensBalance = async (accountAddress: any) => {
    const filters = [
      {
        dataSize: 165,
      },
      {
        memcmp: {
          offset: 32,
          bytes: accountAddress,
        },
      },
    ];

    const programId = new PublicKey(TOKEN_PROGRAM_ID);

    const accounts = await connection.getParsedProgramAccounts(programId, {
      filters,
    });

    const formatedAccounts = accounts.reduce(
      (init: { [x: string]: any }, account: { account: { data: any } }) => {
        const parsedAccountInfo = account.account.data as ParsedAccountData;
        const address = parsedAccountInfo?.parsed?.info?.mint;
        init[address] =
          parsedAccountInfo?.parsed?.info?.tokenAmount?.uiAmount || 0;
        return init;
      },
      {}
    );

    const tokens = Object.entries(formatedAccounts).map(([key, value]) => {
      return { info: tokenMap.get(key), balance: value };
    });

    setTokenList(tokens);
  };

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
    if (safeSignerAddress && tokenMap) {
      getTokensBalance(safeSignerAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenMap, safeSignerAddress]);

  return {
    tokenList,
    renecBalance,
    loading,
    fetchSafeSigner,
    safeSignerAddress,
  };
};

export default useTokenBalances;

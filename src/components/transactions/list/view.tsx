import EmptyList from "@/components/shared/emptyList";
import Loading from "@/components/shared/loading";
import { Box, Pagination, Stack } from "@mui/material";
import { MultisigJob } from "@renec-foundation/multisig-sdk";
import React, { useEffect, useState } from "react";
import TransactionItem from "./item";
import * as styles from "./styles";
import useIsMobile from "@/hooks/useMobileDetection";

type transactionsProps = {
  safeAddress: string;
  proposals: MultisigJob[];
};

const PER_PAGE = 10;

const TransactionList = ({ safeAddress, proposals }: transactionsProps) => {
  const [page, setPage] = useState(1);
  const [list, setList] = useState<MultisigJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  const handleOnChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  useEffect(() => {
    const proposalsSorted = proposals.sort(
      (a, b) => b.createdDate - a.createdDate
    );

    const slicedProposals = proposalsSorted.slice(
      (page - 1) * PER_PAGE,
      page * PER_PAGE
    );

    setIsLoading(true);

    setTimeout(() => {
      setList(slicedProposals);
      setIsLoading(false);
    }, 1000); // Simulating a delay of 1 second
  }, [page, proposals]);

  return (
    <>
      {isLoading ? (
        <Box sx={[styles.boxStyle, styles.flexCenterStyle]}>
          <Loading />
        </Box>
      ) : (
        <>
          {proposals.length > 0 ? (
            <Stack direction="column" spacing={3}>
              <Stack
                sx={isMobile ? {} : styles.boxStyle}
                direction="column"
                spacing={{ xs: 2, md: 3 }}
              >
                {list.map((proposal, index) => (
                  <TransactionItem
                    key={index}
                    isMobile={isMobile}
                    safeAddress={safeAddress}
                    proposal={proposal}
                    isLast={index === list.length - 1}
                  />
                ))}
              </Stack>
              {proposals.length > PER_PAGE && (
                <Box sx={styles.flexCenterStyle}>
                  <Pagination
                    sx={styles.paginationCustomStyle}
                    size="large"
                    count={Math.ceil(proposals.length / PER_PAGE)}
                    page={page}
                    onChange={handleOnChangePage}
                    variant="outlined"
                    shape="rounded"
                    color="primary"
                  />
                </Box>
              )}
            </Stack>
          ) : (
            <EmptyList
              height={250}
              content="You don't have any transactions yet"
            />
          )}
        </>
      )}
    </>
  );
};

export default TransactionList;

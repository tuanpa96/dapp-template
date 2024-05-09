import { DashboardLayout } from "@/components/layout";
import TransactionDetail from "@/components/transactions/detail";

const View = ({
  safeAddress,
  transactionAddress,
}: {
  safeAddress: string;
  transactionAddress: string;
}) => {
  return (
    <DashboardLayout
      withSideBar
      sideName="Transactions"
      safeAddress={safeAddress}
    >
      <TransactionDetail
        safeAddress={safeAddress}
        transactionAddress={transactionAddress}
      />
    </DashboardLayout>
  );
};

export default View;

export const getServerSideProps = async (context: {
  query: { safe_address: string; transaction_address: string };
}) => {
  return {
    props: {
      safeAddress: context.query.safe_address,
      transactionAddress: context.query.transaction_address,
    },
  };
};

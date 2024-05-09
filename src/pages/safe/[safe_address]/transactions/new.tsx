import { DashboardLayout } from "@/components/layout";
import TransactionNew from "@/components/transactions/new";

const View = ({ safeAddress }: { safeAddress: string }) => {
  return (
    <DashboardLayout
      withSideBar
      sideName="Transactions"
      safeAddress={safeAddress}
    >
      <TransactionNew safeAddress={safeAddress} />
    </DashboardLayout>
  );
};

export default View;

export const getServerSideProps = async (context: {
  query: { safe_address: string };
}) => {
  return {
    props: {
      safeAddress: context.query.safe_address,
    },
  };
};

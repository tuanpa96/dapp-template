import { Seo } from "@/components/base";
import { DashboardLayout } from "@/components/layout";
import Transactions from "@/components/transactions";

const View = ({ safeAddress }: { safeAddress: string }) => {
  return (
    <>
      <Seo
        data={{
          title: "Resnow | Shared Wallet on RENEC Blockchain",
          description:
            "Resnow allows you to safeguard your assets and experience shared prosperity with our innovative shared wallet solution on RENEC Blockchain.",
        }}
      />
      <DashboardLayout
        withSideBar
        sideName="Transactions"
        safeAddress={safeAddress}
      >
        <Transactions safeAddress={safeAddress} />
      </DashboardLayout>
    </>
  );
};

export default View;

export const getServerSideProps = async (context: {
  locale: string;
  query: { safe_address: string };
}) => {
  return {
    props: {
      safeAddress: context.query.safe_address,
    },
  };
};

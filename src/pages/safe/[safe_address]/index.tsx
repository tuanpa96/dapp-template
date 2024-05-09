import AssetsPage from "@/components/assets";
import { Seo } from "@/components/base";
import { DashboardLayout } from "@/components/layout";

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
      <DashboardLayout withSideBar sideName="Assets" safeAddress={safeAddress}>
        <AssetsPage safeAddress={safeAddress} />
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

import Assets from "@/components/assets";
import { DashboardLayout } from "@/components/layout";

const AssetsPage = ({ safeAddress }: { safeAddress: string }) => {
  return (
    <DashboardLayout withSideBar sideName="Assets" safeAddress={safeAddress}>
      <Assets safeAddress={safeAddress} />
    </DashboardLayout>
  );
};

export default AssetsPage;

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

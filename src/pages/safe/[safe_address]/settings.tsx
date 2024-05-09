import { DashboardLayout } from "@/components/layout";
import Settings from "@/components/settings";

const SettingsPage = ({ safeAddress }: { safeAddress: string }) => {
  return (
    <DashboardLayout withSideBar sideName="Settings" safeAddress={safeAddress}>
      <Settings safeAddress={safeAddress} />
    </DashboardLayout>
  );
};

export default SettingsPage;

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

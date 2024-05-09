import AddressBook from "@/components/addressBook";
import { DashboardLayout } from "@/components/layout";

const AddressBookPage = ({ safeAddress }: { safeAddress: string }) => {
  return (
    <DashboardLayout
      withSideBar
      sideName="Address book"
      safeAddress={safeAddress}
    >
      <AddressBook />
    </DashboardLayout>
  );
};

export default AddressBookPage;

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

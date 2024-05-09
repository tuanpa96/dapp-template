import { Seo } from "@/components/base";
import { DashboardLayout } from "@/components/layout";

const HomePage = () => {
  return (
    <>
      <Seo
        data={{
          title: "",
          description: "",
        }}
      />
      <DashboardLayout>
        <>
          Codeing here
        </>
      </DashboardLayout>
    </>
  );
};

export default HomePage;

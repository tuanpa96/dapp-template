import { LayoutProps } from "@/components/layout/common";
import SnowFlakeSidebar from "@/components/shared/sideBar";
import TopBar from "@/components/shared/topBar";
import useWindowSize from "@/hooks/useWindowSize";
import { Box } from "@mui/material";
import { useLayoutEffect, useState } from "react";
import * as styles from "./styles";

const DashboardLayout = ({
  children,
  withSideBar,
  sideName,
  safeAddress,
}: LayoutProps) => {
  const [toggleSideBar, setToggleSideBar] = useState<boolean>(true);
  const { width } = useWindowSize();

  useLayoutEffect(() => {
    setToggleSideBar(width > 900);
  }, [width]);

  return (
    <>
      <Box
        sx={{
          borderBottom: "1px solid #383B54",
        }}
      >
        <TopBar
          toggleSideBar={toggleSideBar}
          setToggleSideBar={setToggleSideBar}
          withSideBar={withSideBar}
        />
      </Box>
      <Box sx={styles.layoutContainerStyle}>
        {withSideBar && toggleSideBar && (
          <SnowFlakeSidebar sideName={sideName} safeAddress={safeAddress} />
        )}
        <Box
          sx={{
            height: "100%",
            width: "100%",
            overflow: "auto",
          }}
        >
          <Box sx={styles.mainLayoutStyle}>
            <Box>{children}</Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default DashboardLayout;

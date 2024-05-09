import LogoShortIcon from "@/assets/images/logo-short.png";
import SafeIcon from "@/assets/icons/safe-circle.svg";
import ResnowLogo from "@/assets/images/logo.png";
import useWindowSize from "@/hooks/useWindowSize";
import useIsMobile from "@/hooks/useMobileDetection";
import CloseIcon from "@mui/icons-material/Close";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { WalletMultiButton as DemonWalletConnect } from "@renec-foundation/wallet-adapter-react";
import Image from "next/image";
import { useRouter } from "next/router";
import * as styles from "./styles";

const TopBar = ({
  toggleSideBar,
  setToggleSideBar,
  withSideBar,
}: {
  toggleSideBar: any;
  setToggleSideBar: any;
  withSideBar: any;
}) => {
  const { width } = useWindowSize();
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleToggleSideBar = () => {
    setToggleSideBar(!toggleSideBar);
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      p={2}
      sx={{ backgroundColor: "#202231" }}
    >
      <Box sx={styles.containerBoxStyle}>
        <Image
          src={width >= 600 ? ResnowLogo : LogoShortIcon}
          alt="logo"
          width={width >= 600 ? 152 : 36}
          height={36}
          onClick={isMobile ? undefined : handleToggleSideBar}
        />
        <Box>
          <IconButton>
            <Box
              sx={styles.headerLinkStyle}
              onClick={() => {
                router.push("/");
              }}
            >
              <Image src={SafeIcon} alt="safes" width={24} height={24} />
              <Typography sx={styles.headerLinkTextStyle}>Safes</Typography>
            </Box>
          </IconButton>
        </Box>
        <Stack direction="row">
          <DemonWalletConnect />
          {withSideBar && isMobile && (
            <IconButton onClick={isMobile ? handleToggleSideBar : undefined}>
              {toggleSideBar ? (
                <CloseIcon sx={styles.iconAddStyle} />
              ) : (
                <MenuOutlinedIcon sx={styles.iconAddStyle} />
              )}
            </IconButton>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default TopBar;

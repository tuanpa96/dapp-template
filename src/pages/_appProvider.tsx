import { appProgressState } from "@/atoms/appProgressState";
import { LocaleProvider } from "@/components/shared/langProvider";
import { MultisigProvider } from "@/components/shared/multisigProvider";
import { ProgressBar } from "@/components/shared/progressBar";
import useTheme from "@/hooks/useTheme";
import RootContainer from "@/pages/_rootContainer";
import { darkTheme, lightTheme } from "@/themes/main";
import { E2E_WALLET_PRIVATE_KEY, IS_MAINNET } from "@/utils/constants";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Provider as WalletProvider } from "@renec-foundation/wallet-adapter-react";
import "@renec-foundation/wallet-adapter-react/src/style.css";
import { useIntercom } from "@thanhvo102/react-use-intercom";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { useRecoilState } from "recoil";

interface Props {
  children: ReactElement;
}

declare global {
  interface Window {
    Intercom: any;
  }
}

function AppThemeProvider({ children }: Props): ReactElement {
  const [hasInitialiseWindownIntercom, setHasInitialiseWindownIntercom] =
    useState(false);
  const [mode] = useTheme();
  const { boot } = useIntercom();
  const theme = useMemo(
    () => (mode === "light" ? lightTheme : darkTheme),
    [mode]
  );
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useRecoilState(appProgressState);

  useEffect(() => {
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const htmlTag = document.querySelector("html");

    const callback = (
      mutationList: any[],
      observer: { disconnect: () => void }
    ) => {
      mutationList.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          mutation.target?.className?.includes(
            "intercom-mobile-messenger-active"
          )
        ) {
          htmlTag?.classList.remove("intercom-mobile-messenger-active");
          observer.disconnect();
        }
      });
    };

    const observer = new MutationObserver(callback);
    htmlTag &&
      observer.observe(htmlTag, {
        attributes: true,
      });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (window.Intercom && !hasInitialiseWindownIntercom) {
      setHasInitialiseWindownIntercom(true);

      window.Intercom("onHide", () => {
        const htmlTag = document.getElementsByTagName("html");
        if (htmlTag) {
          htmlTag[0].classList.remove("intercom-mobile-messenger-active");
        }
      });
    }
  }, [hasInitialiseWindownIntercom]);

  useEffect(() => {
    const handleStart = () => {
      setIsAnimating(true);
    };
    const handleStop = () => {
      setIsAnimating(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <RootContainer>
      <ThemeProvider theme={theme}>
        <WalletProvider
          isMainnet={IS_MAINNET}
          e2eWalletPrivKey={E2E_WALLET_PRIVATE_KEY}
        >
          <MultisigProvider>
            <LocaleProvider>
              <ProgressBar isAnimating={isAnimating} />
              <CssBaseline />
              {children}
            </LocaleProvider>
          </MultisigProvider>
        </WalletProvider>
      </ThemeProvider>
    </RootContainer>
  );
}

export default AppThemeProvider;

import { createEmotionCache } from "@/utils/index";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { IntercomProvider } from "@thanhvo102/react-use-intercom";
import { AppProps } from "next/app";
import Head from "next/head";
import PropTypes from "prop-types";
import { useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { RecoilRoot } from "recoil";
import AppProvider from "./_appProvider";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache: EmotionCache;
}

const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || "";

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const [queryClient] = useState(() => new QueryClient());

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title></title>
        <meta
          name="description"
          content=""
        />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <RecoilRoot>
        <IntercomProvider
          appId={INTERCOM_APP_ID}
          apiBase={`https://${INTERCOM_APP_ID}.intercom-messenger.com`}
          widgetUrl={"https://renec.org/intercom-shim.latest.js"}
          onHide={() => {
            const htmlTag = document.getElementsByTagName("html");
            if (htmlTag) {
              htmlTag[0].classList.remove("intercom-mobile-messenger-active");
            }
          }}
        >
          <QueryClientProvider client={queryClient}>
            <AppProvider>
              <Hydrate state={pageProps.dehydratedState}>
                <Component {...pageProps} />
                <ReactQueryDevtools initialIsOpen={false} />
              </Hydrate>
            </AppProvider>
          </QueryClientProvider>
        </IntercomProvider>
      </RecoilRoot>
    </CacheProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};

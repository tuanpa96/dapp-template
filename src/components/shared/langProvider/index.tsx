import useLocalStorage from "@/hooks/useLocalStorage";
import { Box, CircularProgress } from "@mui/material";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import useSWR from "swr";

interface LocaleContextType {
  locale: any;
  handleLocaleChange: (newLocale: string) => void;
}

export const LocaleContext = createContext<LocaleContextType>({
  locale: "",
  handleLocaleChange: Function,
});

async function fetcher(path: RequestInfo | URL) {
  const res = await fetch(path);
  const json = await res.json();
  return json;
}

export const LocaleProvider = ({
  geoApiUrl = "/api/geo",
  children,
}: {
  geoApiUrl?: string;
  children: ReactNode;
}) => {
  const { data, isValidating } = useSWR(geoApiUrl, fetcher, {
    revalidateOnFocus: false,
  });
  const [languageStored, setLanguageStored] = useLocalStorage<string | null>(
    "language",
    null
  );
  const [locale, setLocale] = useState<string | null>(languageStored);

  useEffect(() => {
    if (!languageStored && data?.lang) {
      setLanguageStored(data?.lang);
      setLocale(data?.lang); // Update setLocale with data?.lang instead of locale
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.lang]);

  useEffect(() => {
    if (locale && locale !== languageStored) {
      setLanguageStored(locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const handleLocaleChange = useCallback(
    (newLocale: string): void => {
      setLocale(newLocale as never);
    },
    [setLocale]
  );

  const localeContextValue = useMemo(
    () => ({ locale, handleLocaleChange }),
    [locale, handleLocaleChange]
  );

  if (isValidating) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocaleContext.Provider value={localeContextValue}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocaleContext = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("Missing locale context");
  }

  return context;
};

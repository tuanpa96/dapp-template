import { useLocaleContext } from "@/components/shared/langProvider";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";

interface LocaleHook {
  locale: string;
}

const useLang = (): LocaleHook => {
  const router = useRouter();
  const { locale } = useLocaleContext();

  useEffect(() => {
    handleRouterRedirect(locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRouterRedirect = (newLocale: string): void => {
    const { pathname, query, asPath } = router;

    router.push(
      {
        pathname,
        query,
      },
      asPath,
      { locale: newLocale }
    );
  };

  return useMemo(() => ({ locale }), [locale]);
};

export default useLang;

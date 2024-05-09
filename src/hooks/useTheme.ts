import { appThemeState } from "@/atoms/appThemeState";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import useLocalStorage from "./useLocalStorage";

const useTheme = () => {
  const defaultTheme = "dark";
  const [themeStored, setThemeStored] = useLocalStorage("theme", defaultTheme);
  const [currentTheme, setCurrentTheme] = useRecoilState(appThemeState);

  useEffect(() => {
    themeStored && setCurrentTheme(themeStored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeStored]);

  const setTheme = (activeTheme: any) => {
    if (activeTheme) {
      activeTheme && setCurrentTheme(activeTheme);
      activeTheme && setThemeStored(activeTheme);
    }
  };

  return [currentTheme, setTheme] as const;
};

export default useTheme;

import { selector } from "recoil";
import { appThemeState } from "@/atoms/appThemeState";

export const appThemeStateSelector = selector({
  key: "appThemeStateSelector",
  get: ({ get }) => get(appThemeState),
});

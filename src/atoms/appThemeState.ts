import { atom } from "recoil";

export const appThemeState = atom<string>({
  key: "theme",
  default: "light",
});

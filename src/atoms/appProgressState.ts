import { atom } from "recoil";

export const appProgressState = atom<boolean>({
  key: "appProgressState",
  default: false,
});

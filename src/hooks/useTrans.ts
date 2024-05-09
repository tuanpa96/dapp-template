import { useRouter } from "next/router";
import en from "@/locales/en";
import vi from "@/locales/vi";

const useTrans = () => {
  const { locale } = useRouter();

  const trans = locale === "vi" ? vi : en;

  return trans;
};

export default useTrans;

import { ReactNode } from "react";

export interface LayoutProps {
  children: ReactNode;
  withSideBar?: boolean;
  sideName?: string;
  safeAddress?: string;
}

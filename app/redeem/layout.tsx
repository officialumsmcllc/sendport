// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redeem AppSumo Lifetime License - Sendport",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RedeemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - Sendport",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

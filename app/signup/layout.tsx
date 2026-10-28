// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your Sendport Account",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

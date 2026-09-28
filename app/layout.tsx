import type { Metadata } from "next";
import "./globals.css";
import { RestrictionProvider } from "@/components/profile/restriction-context";

export const metadata: Metadata = {
  title: "Thoughts4food | Food nutrition analysis",
  description: "Understand ingredients and nutrition with uncertainty made visible."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><RestrictionProvider>{children}</RestrictionProvider></body>
    </html>
  );
}

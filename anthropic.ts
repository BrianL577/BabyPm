import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "babyPM — Concept Prototype for CWW Project Delivery",
  description:
    "An interactive concept prototype demonstrating the babyPM AI advisory assistant workflows described in the CWW Project Delivery RFP.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink font-body antialiased">{children}</body>
    </html>
  );
}

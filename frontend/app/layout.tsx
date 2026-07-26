import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finora — AI-Powered Investment Intelligence",
  description: "Multi-agent AI platform for investment research, portfolio optimization, and paper trading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-background text-foreground font-sans tracking-tight selection:bg-white/20 selection:text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

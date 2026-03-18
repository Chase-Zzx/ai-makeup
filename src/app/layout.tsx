import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GlowAI — AI Makeup Generator",
  description:
    "Upload a selfie and discover your ideal makeup looks with AI-powered style generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-[#faf9f6] text-[#1a1a1a] antialiased noise-overlay`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

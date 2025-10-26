import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asset Manager | Solana Blockchain Asset Registry",
  description: "Register, track, and manage your physical and digital assets on Solana blockchain. Multi-signature approvals, maintenance logging, and immutable audit trails.",
  keywords: [
    "Solana",
    "Asset Management",
    "Blockchain",
    "NFT",
    "Web3",
    "Multi-Signature",
    "Maintenance Tracking",
  ],
  authors: [{ name: "Asset Manager Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://asset-manager.example.com",
    siteName: "Asset Manager",
    title: "Asset Manager | Solana Blockchain Asset Registry",
    description:
      "Register, track, and manage your physical and digital assets on Solana blockchain.",
    images: [
      {
        url: "https://asset-manager.example.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Asset Manager",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        {children}
      </body>
    </html>
  );
}

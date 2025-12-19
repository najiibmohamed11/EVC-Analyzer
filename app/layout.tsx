import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
// 1. Import the fonts
import { Geist, Geist_Mono } from "next/font/google";

// 2. Configure them with 'variable' names
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EVC Analyzer",
  description: "Track and analyze your mobile money transactions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Add the variables to the body className */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}

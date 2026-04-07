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
  title: "AgentCity | Operations Center",
  description: "High-fidelity autonomous urban simulation dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/30`}>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,41,59,0.3)_0%,transparent_100%)] pointer-events-none" />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}

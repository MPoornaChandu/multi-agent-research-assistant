import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif"
});

export const metadata: Metadata = {
  title: {
    default: "Multi-Agent Research Assistant",
    template: "%s | Multi-Agent Research Assistant"
  },
  description:
    "A streaming Research Studio that breaks topics into sub-questions, runs parallel Tavily searches, and synthesizes cited markdown reports with Gemini.",
  keywords: [
    "multi-agent research assistant",
    "Next.js 14",
    "LangGraph",
    "LangChain",
    "Gemini",
    "Tavily Search",
    "AI research tool",
    "streaming research app"
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Multi-Agent Research Assistant",
    description:
      "A streaming Research Studio for parallel web research and cited Gemini synthesis.",
    url: "/",
    siteName: "Multi-Agent Research Assistant",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title: "Multi-Agent Research Assistant",
    description:
      "Parallel Tavily research agents with streamed Gemini synthesis in Next.js 14."
  },
  applicationName: "Multi-Agent Research Assistant",
  authors: [{ name: "Multi-Agent Research Assistant" }],
  creator: "Multi-Agent Research Assistant"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

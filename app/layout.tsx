import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
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

const appUrl = "https://multi-agent-research-assistant-delta.vercel.app/";
const title = "Multi-Agent Research Assistant";
const description =
  "A research studio that breaks topics into sub-questions, runs parallel web searches, and synthesizes cited reports.";
const creator = "M. Poorna Chandu";
const themeScript = `
(() => {
  try {
    const key = "research-studio-theme";
    const stored = window.localStorage.getItem(key);
    const mode = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themeMode = mode;
  } catch {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.themeMode = "system";
  }
})();
`;

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s | Multi-Agent Research Assistant"
  },
  description,
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
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Multi-Agent Research Assistant Open Graph preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image.png"],
    creator: "@MPoornaChandu"
  },
  icons: {
    icon: "/icon.svg"
  },
  applicationName: title,
  authors: [{ name: creator }],
  creator,
  publisher: creator
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body
        className={`${inter.variable} ${fraunces.variable} min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

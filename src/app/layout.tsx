import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TerminalProvider } from "@/context/TerminalContext";
import { ResponsibleGamingBanner } from "@/components/common/ResponsibleGamingBanner";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: "Aviator Intelligence X (AIX) — Multi-Agent Quantitative Research Terminal",
  description: "Advanced multi-agent Aviator analytics, statistical modeling, provable fairness verification and calibrated forecasting.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#00d2ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-aix-blue selection:text-black min-h-screen flex flex-col">
        <TerminalProvider>
          <ResponsibleGamingBanner />
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </TerminalProvider>
      </body>
    </html>
  );
}

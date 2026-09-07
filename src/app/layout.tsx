import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { siteConfig, siteUrl, absoluteImage } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: siteConfig.brand,
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.brand}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    url: siteUrl(),
    siteName: siteConfig.brand,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: siteConfig.lang,
    images: [{ url: absoluteImage("/logo.png") }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [absoluteImage("/logo.png")],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteConfig.lang} className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}


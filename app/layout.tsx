import "./globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { defaultLocale, locales } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: ["/favicon.ico", "/logo.png"],
    shortcut: "/favicon.ico",
    apple: "/logo.png"
  },
  title: {
    default: "Furni Enterprise",
    template: "%s | Furni Enterprise"
  },
  description: "Modern furniture e-commerce platform with secure checkout and admin tools.",
  openGraph: {
    title: "Furni Enterprise",
    description: "Design-forward furniture for modern spaces.",
    type: "website",
    images: [{ url: "/logo.png", width: 630, height: 630, alt: "Furni Enterprise Logo" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Furni Enterprise",
    description: "Design-forward furniture for modern spaces.",
    images: ["/logo.png"]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const cookieLocale = cookies().get("NEXT_LOCALE")?.value;
  const locale = locales.includes(cookieLocale as (typeof locales)[number]) ? cookieLocale : defaultLocale;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

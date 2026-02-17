import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/lib/i18n";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";
import { getCategories } from "@/lib/catalog";

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function LocaleLayout({ children, params }: Props) {
  if (!locales.includes(params.locale as (typeof locales)[number])) {
    notFound();
  }

  const [messages, categories] = await Promise.all([getMessages(), getCategories()]);
  const navCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug
  }));

  return (
    <NextIntlClientProvider messages={messages} locale={params.locale}>
      <Providers>
        <div className="relative flex min-h-screen flex-col overflow-hidden">
          <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_25%_5%,rgba(247,231,206,0.16),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_36%)]" />
          <Navbar locale={params.locale} categories={navCategories} />
          <main className="container-shell relative z-10 flex-1 py-10 sm:py-14">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer locale={params.locale} />
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}


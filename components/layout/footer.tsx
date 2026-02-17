import Link from "next/link";
import { CreditCard, Facebook, Instagram, Linkedin, ShieldCheck, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "./brand-logo";

export async function Footer({ locale }: { locale: string }) {
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const tFooter = await getTranslations("footer");

  return (
    <footer className="relative mt-24 border-t border-[color:var(--footer-border)] bg-[color:var(--footer-bg)] text-[color:var(--footer-fg)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--accent)]/80 to-transparent" />
      <div className="container-shell grid gap-10 py-12 md:grid-cols-3">
        <div className="space-y-4">
          <BrandLogo name={tCommon("brand")} imageClassName="h-20 sm:h-24" />
          <p className="text-sm text-[color:var(--footer-muted)]">{tFooter("tagline")}</p>
          <div className="flex gap-2">
            <a href="#" aria-label="Instagram" className="rounded-full border border-[color:var(--footer-border)] bg-[color:var(--control-bg)] p-2 transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="rounded-full border border-[color:var(--footer-border)] bg-[color:var(--control-bg)] p-2 transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="rounded-full border border-[color:var(--footer-border)] bg-[color:var(--control-bg)] p-2 transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
          <div className="flex items-center gap-2 text-xs text-[color:var(--footer-muted)]">
            <CreditCard className="h-3.5 w-3.5 text-[color:var(--accent)]" />
            <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--accent)]" />
            <Truck className="h-3.5 w-3.5 text-[color:var(--accent)]" />
            <span>{tFooter("trust")}</span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 text-sm">
          <p className="font-semibold">{tFooter("links")}</p>
          <Link href={`/${locale}/shop`} className="link-underline inline-flex text-[color:var(--footer-muted)] hover:text-[color:var(--accent)]">
            {tNav("shop")}
          </Link>
          <Link href={`/${locale}/about`} className="link-underline inline-flex text-[color:var(--footer-muted)] hover:text-[color:var(--accent)]">
            {tNav("about")}
          </Link>
          <Link href={`/${locale}/contact`} className="link-underline inline-flex text-[color:var(--footer-muted)] hover:text-[color:var(--accent)]">
            {tNav("contact")}
          </Link>
        </div>

        <form className="space-y-3">
          <p className="font-semibold">{tFooter("newsletter")}</p>
          <p className="text-sm text-[color:var(--footer-muted)]">{tFooter("newsletterDesc")}</p>
          <div className="flex gap-2 rounded-2xl border border-[color:var(--footer-border)] bg-[color:var(--surface)] p-2 backdrop-blur-xl">
            <Input aria-label="Newsletter email" placeholder="you@example.com" type="email" required className="border-0 bg-transparent" />
            <Button type="submit">{tFooter("join")}</Button>
          </div>
        </form>
      </div>
      <div className="border-t border-[color:var(--footer-border)] py-4 text-center text-xs text-[color:var(--footer-muted)]">
        Copyright {new Date().getFullYear()} {tCommon("brand")}. {tFooter("rights")}
      </div>
    </footer>
  );
}

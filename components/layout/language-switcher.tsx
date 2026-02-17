"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const LOCALES = [
  { code: "ka", label: "KA", flag: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Flag_of_Georgia.svg" },
  { code: "en", label: "EN", flag: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg" },
  { code: "ru", label: "RU", flag: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Russia.svg" }
] as const;

type LanguageSwitcherProps = {
  locale: string;
  mobile?: boolean;
};

export function LanguageSwitcher({ locale, mobile = false }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const current = useMemo(() => LOCALES.find((item) => item.code === locale) || LOCALES[0], [locale]);

  function switchLocale(nextLocale: string) {
    if (!pathname) return;

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return;

    segments[0] = nextLocale;
    const query = searchParams.toString();
    const nextPath = query ? `/${segments.join("/")}?${query}` : `/${segments.join("/")}`;

    document.cookie = `NEXT_LOCALE=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    localStorage.setItem("locale", nextLocale);
    setOpen(false);
    router.push(nextPath);
    router.refresh();
  }

  return (
    <div className={`relative ${mobile ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 text-xs font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--control-hover)] ${
          mobile ? "w-full justify-between rounded-2xl px-4" : ""
        }`}
        aria-label="Switch language"
      >
        <span className="inline-flex items-center gap-2">
          <Image
            src={current.flag}
            alt={`${current.label} flag`}
            width={20}
            height={14}
            className="h-3.5 w-5 rounded-[2px] border border-[color:var(--control-border)] object-cover"
          />
          <span>{current.label}</span>
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`glass-panel z-30 mt-2 p-1 ${mobile ? "absolute left-0 w-full" : "absolute right-0 w-36"}`}
          >
            {LOCALES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => switchLocale(item.code)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${
                  item.code === locale
                    ? "bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-fg)]"
                    : "text-[color:var(--foreground)] hover:bg-[color:var(--surface-strong)]"
                }`}
              >
                <Image
                  src={item.flag}
                  alt={`${item.label} flag`}
                  width={20}
                  height={14}
                  className="h-3.5 w-5 rounded-[2px] border border-[color:var(--control-border)] object-cover"
                />
                <span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

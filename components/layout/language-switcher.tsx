"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const LOCALES = [
  { code: "ka", label: "KA", flag: "/flags/ka.svg" },
  { code: "en", label: "EN", flag: "/flags/en.svg" },
  { code: "ru", label: "RU", flag: "/flags/ru.svg" }
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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuId = `locale-menu-${mobile ? "mobile" : "desktop"}`;

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

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${mobile ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
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
            sizes="20px"
            className="h-3.5 w-5 rounded-[2px] border border-[color:var(--control-border)] object-cover"
          />
          <span>{current.label}</span>
        </span>
      </button>

      {open ? (
        <div id={menuId} role="menu" className={`glass-panel z-30 mt-2 p-1 ${mobile ? "absolute left-0 w-full" : "absolute right-0 w-36"}`}>
          {LOCALES.map((item) => (
            <button
              key={item.code}
              type="button"
              role="menuitemradio"
              aria-checked={item.code === locale}
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
                sizes="20px"
                className="h-3.5 w-5 rounded-[2px] border border-[color:var(--control-border)] object-cover"
              />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

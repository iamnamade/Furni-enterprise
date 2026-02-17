"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Grid3X3,
  House,
  Info,
  LogIn,
  Mail,
  Menu,
  Search,
  ShoppingBag,
  Store,
  User,
  UserPlus,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { BrandLogo } from "./brand-logo";
import { MiniCartOverlay } from "./mini-cart-overlay";
import { useCartStore } from "@/lib/zustand-cart";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";

const SEARCH_SUGGESTIONS = ["Sofa", "Dining Table", "Lounge Chair", "Oak Collection", "Desk", "Storage"];
const CATEGORY_GROUPS = {
  byRoom: ["living-room", "bedroom", "dining-room", "outdoor", "home-office"],
  byType: ["soft-furniture", "beds", "chairs-armchairs", "tables"]
};

type NavbarProps = {
  locale: string;
  categories: Array<{ id: string; name: string; slug: string }>;
};

export function Navbar({ locale, categories }: NavbarProps) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tAccount = useTranslations("account");
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const items = useCartStore((state) => state.items);
  const count = useCartStore((state) => state.totalItems());
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const closeCartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const prevCountRef = useRef(count);
  const didInitCartEffectRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!didInitCartEffectRef.current) {
      didInitCartEffectRef.current = true;
      prevCountRef.current = count;
      return;
    }

    const prev = prevCountRef.current;
    if (count > prev) {
      setCartOpen(true);
      if (closeCartTimeoutRef.current) clearTimeout(closeCartTimeoutRef.current);
      closeCartTimeoutRef.current = setTimeout(() => setCartOpen(false), 3200);
    }
    prevCountRef.current = count;
  }, [count]);

  useEffect(() => {
    return () => {
      if (closeCartTimeoutRef.current) clearTimeout(closeCartTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (pathname.includes("/shop")) {
      const query = new URLSearchParams(window.location.search).get("search") || "";
      setSearch(query);
    }
  }, [pathname]);

  const desktopLinks = [
    { href: `/${locale}`, label: tNav("home") },
    { href: `/${locale}/shop`, label: tNav("shop") },
    { href: `/${locale}/about`, label: tNav("about") },
    { href: `/${locale}/contact`, label: tNav("contact") }
  ];

  const accountLinks = [
    ...(session?.user ? [{ href: `/${locale}/profile`, label: tAccount("profile") }] : []),
    ...(session?.user ? [{ href: `/${locale}/orders`, label: tNav("orders") }] : []),
    ...(session?.user?.role === "ADMIN" ? [{ href: `/${locale}/admin`, label: tNav("admin") }] : [])
  ];

  const filteredSuggestions = useMemo(() => {
    if (!search.trim()) return SEARCH_SUGGESTIONS.slice(0, 4);
    return SEARCH_SUGGESTIONS.filter((item) => item.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
  }, [search]);

  const byRoomLabel = tNav.has("byRoom")
    ? tNav("byRoom")
    : locale === "ka"
      ? "ოთახის მიხედვით"
      : locale === "ru"
        ? "По комнате"
        : "By room";
  const byTypeLabel = tNav.has("byProductType")
    ? tNav("byProductType")
    : locale === "ka"
      ? "პროდუქტის ტიპით"
      : locale === "ru"
        ? "По типу"
        : "By product type";

  const groupedCategories = useMemo(() => {
    const bySlug = new Map(categories.map((category) => [category.slug, category]));
    return {
      byRoom: CATEGORY_GROUPS.byRoom.map((slug) => bySlug.get(slug)).filter(Boolean) as typeof categories,
      byType: CATEGORY_GROUPS.byType.map((slug) => bySlug.get(slug)).filter(Boolean) as typeof categories
    };
  }, [categories]);

  const subtotal = totalPrice();
  const displayCount = isMounted ? count : 0;

  function submitSearch(value: string) {
    const query = value.trim();
    if (!query) {
      router.push(`/${locale}/shop`);
      return;
    }
    router.push(`/${locale}/shop?search=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  function highlightSuggestion(text: string) {
    if (!search.trim()) return text;
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    if (idx < 0) return text;

    return (
      <>
        {text.slice(0, idx)}
        <span className="text-accent">{text.slice(idx, idx + search.length)}</span>
        {text.slice(idx + search.length)}
      </>
    );
  }

  const chipClass =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--control-border)] bg-[color:var(--control-bg)] text-[color:var(--foreground)] transition duration-300 hover:border-[color:var(--accent)] hover:bg-[color:var(--control-hover)] active:scale-[0.96]";

  const mobileItemClass =
    "group flex min-h-12 w-full items-center justify-between rounded-2xl border border-[color:var(--control-border)] bg-white/80 px-4 py-3 text-sm font-medium text-[color:var(--foreground)] shadow-[0_8px_24px_rgba(16,44,38,0.08)] transition duration-300 hover:border-[color:var(--accent)] hover:bg-white active:scale-[0.98] dark:bg-[#173a33] dark:hover:bg-[#1d453d]";

  const mobileNav = [
    { href: `/${locale}`, label: tNav("home"), icon: House },
    { href: `/${locale}/shop`, label: tNav("shop"), icon: Store },
    { href: `/${locale}/about`, label: tNav("about"), icon: Info },
    { href: `/${locale}/contact`, label: tNav("contact"), icon: Mail }
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-[color:var(--nav-bg)] backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Link href={`/${locale}`} aria-label={tCommon("brand")} className="shrink-0">
          <BrandLogo name={tCommon("brand")} priority imageClassName="h-14 sm:h-16" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-5 text-sm md:flex">
          {desktopLinks.map((link) => (
            <Link key={link.href} href={link.href} className="link-underline text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]">
              {link.label}
            </Link>
          ))}
          <details className="group relative">
            <summary className="list-none cursor-pointer text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]">
              {tNav("categories")}
            </summary>
            <div className="glass-panel absolute left-0 top-8 z-30 w-[520px] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">{byRoomLabel}</p>
                  <div className="space-y-1">
                    {groupedCategories.byRoom.map((category) => (
                      <Link
                        key={category.id}
                        href={`/${locale}/shop?category=${category.slug}`}
                        className="block rounded-xl px-3 py-2 text-sm hover:bg-[color:var(--surface-strong)]"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">{byTypeLabel}</p>
                  <div className="space-y-1">
                    {groupedCategories.byType.map((category) => (
                      <Link
                        key={category.id}
                        href={`/${locale}/shop?category=${category.slug}`}
                        className="block rounded-xl px-3 py-2 text-sm hover:bg-[color:var(--surface-strong)]"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </details>
        </nav>

        <div className="relative hidden flex-1 md:flex md:max-w-xl">
          <form
            className="group w-full"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch(search);
            }}
          >
            <div className="relative transition-all duration-300 focus-within:scale-[1.01]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={tNav("searchPlaceholder")}
                aria-label={tNav("searchPlaceholder")}
                className="h-11 w-full rounded-full border bg-[color:var(--surface)] pl-11 pr-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] transition duration-300 focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--ring)]"
              />
            </div>
          </form>
          <AnimatePresence>
            {filteredSuggestions.length > 0 && search.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="glass-panel absolute left-0 top-12 z-40 w-full p-2"
              >
                {filteredSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-strong)]"
                    onClick={() => {
                      setSearch(item);
                      submitSearch(item);
                    }}
                  >
                    {highlightSuggestion(item)}
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button type="button" aria-label={tNav("openCart")} onClick={() => setCartOpen(true)} className={chipClass}>
            <ShoppingBag className="h-4 w-4" />
            {displayCount > 0 ? (
              <motion.span
                key={`desk-badge-${displayCount}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.95, 1.25, 1] }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="absolute -right-1 -top-1 rounded-full bg-[color:var(--button-primary-bg)] px-1.5 text-[10px] text-[color:var(--button-primary-fg)]"
              >
                {displayCount}
              </motion.span>
            ) : null}
          </button>

          <div className="relative" ref={accountRef}>
            <button
              type="button"
              className={chipClass}
              aria-label={session?.user ? tAccount("profile") : tCommon("signIn")}
              onClick={() => {
                if (!session?.user) {
                  setAuthOpen(true);
                  return;
                }
                if (session.user.role === "ADMIN") {
                  setAccountOpen((value) => !value);
                  return;
                }
                router.push(`/${locale}/profile`);
              }}
            >
              <User className="h-4 w-4" />
            </button>
            {session?.user && accountOpen ? (
              <div className="glass-panel absolute left-0 top-full mt-2 w-48 p-2">
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setAccountOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm hover:bg-[color:var(--surface-strong)]"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[color:var(--surface-strong)]"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  type="button"
                >
                  {tCommon("signOut")}
                </button>
              </div>
            ) : null}
          </div>

          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className={`${chipClass} md:hidden`}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-[color:var(--overlay-scrim)] backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed inset-y-0 right-0 z-50 flex h-dvh w-screen flex-col border-l border-[color:var(--glass-border)] bg-[#f7e7ce] text-[#102c26] dark:bg-[#102c26] dark:text-[#f7e7ce] sm:w-[88vw] sm:max-w-[420px]"
            >
              <div className="shrink-0 flex items-center justify-between border-b border-[color:var(--control-border)] px-5 py-4">
                <BrandLogo name={tCommon("brand")} imageClassName="h-12" />
                <button type="button" onClick={() => setOpen(false)} className={chipClass} aria-label="Close mobile menu">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <form
                  className="mb-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitSearch(search);
                  }}
                >
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={tNav("searchPlaceholder")}
                      aria-label={tNav("searchPlaceholder")}
                      className="h-12 w-full rounded-full border border-[color:var(--control-border)] bg-white/85 pl-11 pr-4 text-sm text-[#102c26] placeholder:text-[color:var(--muted)] transition duration-300 focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--ring)] dark:bg-[#173a33] dark:text-[#f7e7ce]"
                    />
                  </div>
                </form>

                <div className="space-y-3">
                  {mobileNav.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link key={link.href} href={link.href} className={mobileItemClass} onClick={() => setOpen(false)}>
                        <span className="inline-flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <span className="link-underline">{link.label}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5" />
                      </Link>
                    );
                  })}

                  <button type="button" className={mobileItemClass} onClick={() => setCategoryOpen((v) => !v)}>
                    <span className="inline-flex items-center gap-3">
                      <Grid3X3 className="h-4 w-4" />
                      <span>{tNav("categories")}</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 transition ${categoryOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {categoryOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 rounded-2xl border border-[color:var(--control-border)] bg-white/70 p-3 dark:bg-[#15362f]">
                          <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">{byRoomLabel}</p>
                          {groupedCategories.byRoom.map((category) => (
                            <Link
                              key={category.id}
                              href={`/${locale}/shop?category=${category.slug}`}
                              className="block rounded-xl px-3 py-2 text-sm text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-strong)]"
                              onClick={() => setOpen(false)}
                            >
                              {category.name}
                            </Link>
                          ))}
                          <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">{byTypeLabel}</p>
                          {groupedCategories.byType.map((category) => (
                            <Link
                              key={category.id}
                              href={`/${locale}/shop?category=${category.slug}`}
                              className="block rounded-xl px-3 py-2 text-sm text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-strong)]"
                              onClick={() => setOpen(false)}
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <div className="my-4 h-px bg-[color:var(--control-border)]" />

                  <button
                    type="button"
                    className={mobileItemClass}
                    onClick={() => {
                      setOpen(false);
                      setCartOpen(true);
                    }}
                  >
                    <span className="inline-flex items-center gap-3">
                      <ShoppingBag className="h-4 w-4" />
                      <span>{tCommon("cart")}</span>
                    </span>
                    {displayCount > 0 ? (
                      <motion.span
                        key={`mob-badge-${displayCount}`}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.95, 1.22, 1] }}
                        transition={{ duration: 0.32, ease: "easeOut" }}
                        className="rounded-full bg-[color:var(--button-primary-bg)] px-2 py-0.5 text-xs text-[color:var(--button-primary-fg)]"
                      >
                        {displayCount}
                      </motion.span>
                    ) : (
                      <span className="text-xs text-[color:var(--muted)]">0</span>
                    )}
                  </button>

                  {!session?.user ? (
                    <>
                      <Link href={`/${locale}/login`} className={mobileItemClass} onClick={() => setOpen(false)}>
                        <span className="inline-flex items-center gap-3">
                          <LogIn className="h-4 w-4" />
                          <span>{tNav("login")}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </Link>
                      <Link href={`/${locale}/register`} className={mobileItemClass} onClick={() => setOpen(false)}>
                        <span className="inline-flex items-center gap-3">
                          <UserPlus className="h-4 w-4" />
                          <span>{tNav("register")}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </Link>
                    </>
                  ) : (
                    <button
                      type="button"
                      className={mobileItemClass}
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: `/${locale}` });
                      }}
                    >
                      <span className="inline-flex items-center gap-3">
                        <LogIn className="h-4 w-4" />
                        <span>{tCommon("signOut")}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-60" />
                    </button>
                  )}

                  <div className="my-4 h-px bg-[color:var(--control-border)]" />

                  <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <LanguageSwitcher locale={locale} mobile />
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-t border-[color:var(--control-border)] bg-[#f7e7ce]/95 p-5 backdrop-blur-md dark:bg-[#102c26]/95">
                <Link href={displayCount > 0 ? `/${locale}/cart` : `/${locale}/shop`} onClick={() => setOpen(false)}>
                  <Button className="w-full">{displayCount > 0 ? tNav("viewCartCta") : tNav("shopNowCta")}</Button>
                </Link>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <MiniCartOverlay
        open={cartOpen}
        locale={locale}
        items={items}
        subtotal={subtotal}
        title={tNav("miniCart")}
        emptyLabel={tNav("emptyCart")}
        subtotalLabel={tCommon("subtotal")}
        checkoutLabel={tCommon("checkout")}
        viewCartLabel={tCommon("viewFullCart")}
        decreaseLabel={tCommon("decreaseQuantity")}
        increaseLabel={tCommon("increaseQuantity")}
        removeLabel={tCommon("remove")}
        onClose={() => setCartOpen(false)}
        onRemove={removeItem}
        onUpdateQty={updateQty}
      />
      <AuthModal open={authOpen} locale={locale} onClose={() => setAuthOpen(false)} />
    </header>
  );
}

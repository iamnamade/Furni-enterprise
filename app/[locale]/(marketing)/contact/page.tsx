import { getTranslations } from "next-intl/server";

export default async function ContactPage() {
  const t = await getTranslations("contactPage");

  return (
    <section className="glass-panel mx-auto max-w-2xl space-y-5 p-8 sm:p-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">{t("kicker")}</p>
      <h1 className="text-4xl font-bold tracking-[-0.03em] text-[color:var(--foreground)]">{t("title")}</h1>
      <p className="text-[color:var(--muted)]">{t("description")}</p>
      <div className="space-y-2 text-sm text-[color:var(--foreground)]">
        <p>
          {t("emailLabel")}: <span className="text-accent">hello@furnienterprise.com</span>
        </p>
        <p>
          {t("phoneLabel")}: <span className="text-accent">+1 (555) 010-2026</span>
        </p>
      </div>
    </section>
  );
}


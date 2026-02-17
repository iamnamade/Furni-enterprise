import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { locales, defaultLocale } from "@/lib/i18n";

export default function IndexPage() {
  const localeCookie = cookies().get("NEXT_LOCALE")?.value;
  const locale = locales.includes(localeCookie as (typeof locales)[number]) ? localeCookie : defaultLocale;
  redirect(`/${locale}`);
}

import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "../lib/i18n";
import en from "../messages/en.json";
import ka from "../messages/ka.json";
import ru from "../messages/ru.json";

const messagesByLocale = {
  en,
  ka,
  ru
};

export default getRequestConfig(async ({ locale }) => {
  const requestLocale = await locale;
  const resolvedLocale =
    requestLocale && locales.includes(requestLocale as (typeof locales)[number])
      ? (requestLocale as (typeof locales)[number])
      : undefined;

  if (!resolvedLocale) {
    notFound();
  }

  return {
    locale: resolvedLocale,
    messages: messagesByLocale[resolvedLocale]
  };
});

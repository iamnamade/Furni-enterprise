import { z } from "zod";
import { apiError, parseError } from "@/lib/errors";
import { isValidCsrfRequest } from "@/lib/csrf";
import { applyRateLimitByKey } from "@/lib/rate-limit";
import { sendNewsletterLeadEmail } from "@/lib/email";
import { defaultLocale, locales } from "@/lib/i18n";
import { getClientIp, hasJsonContentType, isPayloadTooLarge } from "@/lib/request-guard";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
  locale: z.enum(locales).optional()
});

type ResponseText = {
  invalidEmail: string;
  tooManyRequests: string;
  notConfigured: string;
  success: string;
};

const responseText: Record<(typeof locales)[number], ResponseText> = {
  en: {
    invalidEmail: "Please enter a valid email address.",
    tooManyRequests: "Too many subscription attempts. Please try again later.",
    notConfigured: "Newsletter recipient email is not configured.",
    success: "Subscription received. Thank you."
  },
  ka: {
    invalidEmail: "გთხოვ, სწორად მიუთითე ელფოსტა.",
    tooManyRequests: "ძალიან ბევრი მცდელობაა. სცადე მოგვიანებით.",
    notConfigured: "ნიუსლეთერის მიმღები ელფოსტა კონფიგურირებული არ არის.",
    success: "გამოწერა მიღებულია. მადლობა."
  },
  ru: {
    invalidEmail: "Укажите корректный email.",
    tooManyRequests: "Слишком много попыток. Попробуйте позже.",
    notConfigured: "Не настроен email получателя подписок.",
    success: "Подписка получена. Спасибо."
  }
};

function pickLocale(locale?: string): (typeof locales)[number] {
  if (!locale) return defaultLocale;
  if (locales.includes(locale as (typeof locales)[number])) {
    return locale as (typeof locales)[number];
  }
  return defaultLocale;
}

function extractEmailAddress(value?: string) {
  if (!value) return "";
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim();
}

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (!hasJsonContentType(request)) return apiError("Expected application/json", 415);
    if (isPayloadTooLarge(request, 16 * 1024)) return apiError("Payload too large", 413);

    const ip = getClientIp(request);
    const ipRate = await applyRateLimitByKey(`newsletter:subscribe:ip:${ip}`, 20, 3600);
    if (!ipRate.success) return apiError("Too many requests", 429);

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    const locale = pickLocale(
      typeof body === "object" && body !== null && "locale" in body
        ? String((body as { locale?: unknown }).locale ?? "")
        : undefined
    );
    const t = responseText[locale];

    if (!parsed.success) return apiError(t.invalidEmail, 422);

    const subscriberEmail = parsed.data.email.toLowerCase().trim();
    const emailRate = await applyRateLimitByKey(`newsletter:subscribe:email:${subscriberEmail}`, 4, 3600);
    if (!emailRate.success) return apiError(t.tooManyRequests, 429);

    const recipientEmail = process.env.NEWSLETTER_NOTIFY_EMAIL?.trim() || extractEmailAddress(process.env.FROM_EMAIL);
    if (!recipientEmail) return apiError(t.notConfigured, 500);

    await sendNewsletterLeadEmail({
      to: recipientEmail,
      subscriberEmail,
      locale,
      ip,
      userAgent: request.headers.get("user-agent") || "unknown"
    });

    return Response.json({ success: true, message: t.success });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}


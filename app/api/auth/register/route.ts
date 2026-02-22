import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { registerSchema } from "@/lib/validators";
import { isValidCsrfRequest } from "@/lib/csrf";
import { verifyRecaptchaToken } from "@/lib/captcha";
import { applyRateLimitByKey } from "@/lib/rate-limit";
import { getClientIp, hasJsonContentType, isPayloadTooLarge } from "@/lib/request-guard";

function getEmailExistsMessage(locale: string) {
  if (locale === "ka") return "ამ ელფოსტით უკვე არსებობს ანგარიში.";
  if (locale === "ru") return "Аккаунт с этой электронной почтой уже существует.";
  return "An account with this email already exists.";
}

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (!hasJsonContentType(request)) return apiError("Expected application/json", 415);
    if (isPayloadTooLarge(request, 32 * 1024)) return apiError("Payload too large", 413);

    const ip = getClientIp(request);
    const rate = await applyRateLimitByKey(`register:${ip}`, 8, 300);
    if (!rate.success) return apiError("Too many requests", 429);

    const body = await request.json();
    const locale = typeof body?.locale === "string" ? body.locale : "en";
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const captchaValid = await verifyRecaptchaToken(parsed.data.captchaToken);
    if (!captchaValid) return apiError("Captcha validation failed", 422);

    const email = parsed.data.email.toLowerCase().trim();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return apiError(getEmailExistsMessage(locale), 409);
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name.trim(),
        passwordHash: await bcrypt.hash(parsed.data.password, 12)
      }
    });

    return Response.json(
      {
        success: true,
        id: user.id,
        email: user.email
      },
      { status: 201 }
    );
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

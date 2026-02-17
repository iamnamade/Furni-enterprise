import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { isValidCsrfRequest } from "@/lib/csrf";
import { verifyRecaptchaToken } from "@/lib/captcha";
import { applyRateLimitByKey } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validators";
import { createSecureToken } from "@/lib/security";
import { sendPasswordResetEmail } from "@/lib/email";
import { defaultLocale, locales } from "@/lib/i18n";
import { isPayloadTooLarge } from "@/lib/request-guard";

const requestSchema = forgotPasswordSchema.extend({
  locale: z.enum(locales).optional()
});

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (isPayloadTooLarge(request, 32 * 1024)) return apiError("Payload too large", 413);

    const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
      .split(",")[0]
      .trim();
    const ipRate = await applyRateLimitByKey(`forgot-password:${ip}`, 8, 300);
    if (!ipRate.success) return apiError("Too many requests", 429);

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const captchaValid = await verifyRecaptchaToken(parsed.data.captchaToken);
    if (!captchaValid) return apiError("Captcha validation failed", 422);

    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    });

    if (user) {
      const { token, tokenHash } = createSecureToken(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.$transaction(async (tx) => {
        await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
        await tx.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt
          }
        });
      });

      const locale = parsed.data.locale ?? defaultLocale;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/${locale}/reset-password?token=${encodeURIComponent(token)}`;
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl
      });
    }

    return Response.json({
      success: true,
      message: "If an account exists for this email, a reset link has been sent."
    });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

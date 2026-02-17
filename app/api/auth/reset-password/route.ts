import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { isValidCsrfRequest } from "@/lib/csrf";
import { verifyRecaptchaToken } from "@/lib/captcha";
import { applyRateLimitByKey } from "@/lib/rate-limit";
import { resetPasswordRequestSchema } from "@/lib/validators";
import { hashToken } from "@/lib/security";
import { isPayloadTooLarge } from "@/lib/request-guard";

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (isPayloadTooLarge(request, 32 * 1024)) return apiError("Payload too large", 413);

    const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
      .split(",")[0]
      .trim();
    const rate = await applyRateLimitByKey(`reset-password:${ip}`, 10, 300);
    if (!rate.success) return apiError("Too many requests", 429);

    const body = await request.json();
    const parsed = resetPasswordRequestSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const captchaValid = await verifyRecaptchaToken(parsed.data.captchaToken);
    if (!captchaValid) return apiError("Captcha validation failed", 422);

    const tokenHash = hashToken(parsed.data.token);
    const now = new Date();
    const reset = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now }
      },
      select: { id: true, userId: true }
    });

    if (!reset) return apiError("Invalid or expired token", 400);

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: reset.userId },
        data: { passwordHash }
      });
      await tx.passwordResetToken.update({
        where: { id: reset.id },
        data: { usedAt: new Date() }
      });
      await tx.passwordResetToken.deleteMany({
        where: {
          userId: reset.userId,
          id: { not: reset.id }
        }
      });
    });

    return Response.json({ success: true });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { registerSchema } from "@/lib/validators";
import { isValidCsrfRequest } from "@/lib/csrf";
import { verifyRecaptchaToken } from "@/lib/captcha";
import { applyRateLimitByKey } from "@/lib/rate-limit";
import { isPayloadTooLarge } from "@/lib/request-guard";

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (isPayloadTooLarge(request, 32 * 1024)) return apiError("Payload too large", 413);

    const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
      .split(",")[0]
      .trim();
    const rate = await applyRateLimitByKey(`register:${ip}`, 8, 300);
    if (!rate.success) return apiError("Too many requests", 429);

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const captchaValid = await verifyRecaptchaToken(parsed.data.captchaToken);
    if (!captchaValid) return apiError("Captcha validation failed", 422);

    const email = parsed.data.email.toLowerCase().trim();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return Response.json(
        { success: true, message: "If this email can be registered, the account is ready to sign in." },
        { status: 201 }
      );
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

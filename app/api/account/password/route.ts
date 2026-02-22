import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { isValidCsrfRequest } from "@/lib/csrf";
import { applyRateLimitByKey } from "@/lib/rate-limit";
import { getClientIp, hasJsonContentType, isPayloadTooLarge } from "@/lib/request-guard";

const schema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z
    .string()
    .min(8).max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, "Password must include uppercase, lowercase, number, and special character.")
});

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (!hasJsonContentType(request)) return apiError("Expected application/json", 415);
    if (isPayloadTooLarge(request, 16 * 1024)) return apiError("Payload too large", 413);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const ip = getClientIp(request);
    const rate = await applyRateLimitByKey(`account-password:${session.user.id}:${ip}`, 12, 300);
    if (!rate.success) return apiError("Too many requests", 429);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError("Invalid input", 422);
    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return apiError("New password must be different from current password", 422);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true }
    });
    if (!user) return apiError("User not found", 404);

    const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!ok) return apiError("Current password is incorrect", 422);

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash }
    });

    return Response.json({ success: true });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

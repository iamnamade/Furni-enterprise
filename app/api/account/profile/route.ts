import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { isValidCsrfRequest } from "@/lib/csrf";
import { applyRateLimitByKey } from "@/lib/rate-limit";
import { getClientIp, hasJsonContentType, isPayloadTooLarge } from "@/lib/request-guard";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80)
});

export async function PATCH(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (!hasJsonContentType(request)) return apiError("Expected application/json", 415);
    if (isPayloadTooLarge(request, 16 * 1024)) return apiError("Payload too large", 413);

    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    const ip = getClientIp(request);
    const rate = await applyRateLimitByKey(`account-profile:${session.user.id}:${ip}`, 20, 300);
    if (!rate.success) return apiError("Too many requests", 429);

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
      select: { id: true, name: true, email: true }
    });

    return Response.json(user);
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

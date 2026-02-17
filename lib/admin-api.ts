import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/errors";
import { applyRateLimitByKey } from "@/lib/rate-limit";

export async function requireAdminApi(request?: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: apiError("Unauthorized", 401) };
  }

  if (request) {
    const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
      .split(",")[0]
      .trim();
    const path = new URL(request.url).pathname;
    const rate = await applyRateLimitByKey(`admin-api:${session.user.id}:${path}:${request.method}:${ip}`, 180, 60);
    if (!rate.success) {
      return { error: apiError("Too many requests", 429) };
    }
  }

  return { session };
}

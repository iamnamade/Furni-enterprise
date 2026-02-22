import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { apiError, parseError } from "@/lib/errors";
import { isValidCsrfRequest } from "@/lib/csrf";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { applyRateLimitByKey } from "@/lib/rate-limit";
import { getClientIp, hasJsonContentType, isPayloadTooLarge } from "@/lib/request-guard";

const uploadSchema = z.object({
  file: z.string().trim().startsWith("data:image/", "Invalid image payload").max(8 * 1024 * 1024),
  folder: z.string().trim().min(1).max(120).regex(/^[a-zA-Z0-9/_-]+$/).optional()
});

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (!hasJsonContentType(request)) return apiError("Expected application/json", 415);
    if (isPayloadTooLarge(request, 8 * 1024 * 1024)) return apiError("Payload too large", 413);

    const ip = getClientIp(request);
    const rate = await applyRateLimitByKey(`admin-upload:${ip}`, 30, 300);
    if (!rate.success) return apiError("Too many requests", 429);

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const uploaded = await uploadToCloudinary(parsed.data.file, parsed.data.folder ?? "furni/products");
    return Response.json(
      {
        ...uploaded,
        secure_url: uploaded.secureUrl,
        url: uploaded.secureUrl
      },
      { status: 201 }
    );
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

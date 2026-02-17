import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { apiError, parseError } from "@/lib/errors";
import { isValidCsrfRequest } from "@/lib/csrf";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { applyRateLimitByKey } from "@/lib/rate-limit";
import { isPayloadTooLarge } from "@/lib/request-guard";

const uploadSchema = z.object({
  file: z.string().min(20),
  folder: z.string().optional()
});

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (isPayloadTooLarge(request, 8 * 1024 * 1024)) return apiError("Payload too large", 413);

    const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
      .split(",")[0]
      .trim();
    const rate = await applyRateLimitByKey(`admin-upload:${ip}`, 30, 300);
    if (!rate.success) return apiError("Too many requests", 429);

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.message, 422);

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

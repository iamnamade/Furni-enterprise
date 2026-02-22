import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { cacheDel } from "@/lib/redis";
import { categorySchema, idParamSchema } from "@/lib/validators";
import { isValidCsrfRequest } from "@/lib/csrf";
import { requireAdminApi } from "@/lib/admin-api";
import { hasJsonContentType, isPayloadTooLarge } from "@/lib/request-guard";

type Params = {
  params: { id: string };
};

export async function PUT(request: Request, { params }: Params) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (!hasJsonContentType(request)) return apiError("Expected application/json", 415);
    if (isPayloadTooLarge(request, 32 * 1024)) return apiError("Payload too large", 413);

    const auth = await requireAdminApi(request);
    if (auth.error) return auth.error;

    const idParsed = idParamSchema.safeParse(params);
    if (!idParsed.success) return apiError("Invalid category id", 422);

    const body = await request.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const category = await prisma.category.update({
      where: { id: idParsed.data.id },
      data: parsed.data
    });

    await cacheDel("category:*");
    return Response.json(category);
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);

    const auth = await requireAdminApi(request);
    if (auth.error) return auth.error;

    const idParsed = idParamSchema.safeParse(params);
    if (!idParsed.success) return apiError("Invalid category id", 422);

    await prisma.category.delete({ where: { id: idParsed.data.id } });
    await cacheDel("category:*");

    return Response.json({ success: true });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

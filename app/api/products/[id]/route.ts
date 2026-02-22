import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { cacheDel } from "@/lib/redis";
import { idParamSchema, productSchema } from "@/lib/validators";
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
    if (isPayloadTooLarge(request, 64 * 1024)) return apiError("Payload too large", 413);

    const auth = await requireAdminApi(request);
    if (auth.error) return auth.error;

    const idParsed = idParamSchema.safeParse(params);
    if (!idParsed.success) return apiError("Invalid product id", 422);

    const body = await request.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const product = await prisma.product.update({
      where: { id: idParsed.data.id },
      data: parsed.data
    });

    await cacheDel("products:*");
    await cacheDel("featured:*");
    await cacheDel("category:*");

    return Response.json(product);
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
    if (!idParsed.success) return apiError("Invalid product id", 422);

    await prisma.product.delete({ where: { id: idParsed.data.id } });
    await cacheDel("products:*");
    await cacheDel("featured:*");
    await cacheDel("category:*");

    return Response.json({ success: true });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

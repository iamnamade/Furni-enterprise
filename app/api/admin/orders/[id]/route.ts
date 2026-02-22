import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { requireAdminApi } from "@/lib/admin-api";
import { adminOrderStatusSchema, idParamSchema } from "@/lib/validators";
import { isValidCsrfRequest } from "@/lib/csrf";
import { hasJsonContentType, isPayloadTooLarge } from "@/lib/request-guard";

type Params = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (!hasJsonContentType(request)) return apiError("Expected application/json", 415);
    if (isPayloadTooLarge(request, 16 * 1024)) return apiError("Payload too large", 413);

    const auth = await requireAdminApi(request);
    if (auth.error) return auth.error;

    const idParsed = idParamSchema.safeParse(params);
    if (!idParsed.success) return apiError("Invalid order id", 422);

    const body = await request.json();
    const parsed = adminOrderStatusSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const order = await prisma.order.update({
      where: { id: idParsed.data.id },
      data: { status: parsed.data.status }
    });

    return Response.json(order);
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

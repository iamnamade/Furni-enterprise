import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { requireAdminApi } from "@/lib/admin-api";
import { adminOrderStatusSchema } from "@/lib/validators";
import { isValidCsrfRequest } from "@/lib/csrf";

type Params = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);

    const auth = await requireAdminApi(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const parsed = adminOrderStatusSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status }
    });

    return Response.json(order);
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

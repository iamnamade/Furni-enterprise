import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { productSchema } from "@/lib/validators";
import { requireAdminApi } from "@/lib/admin-api";
import { isValidCsrfRequest } from "@/lib/csrf";
import { cacheDel } from "@/lib/redis";

type Params = {
  params: { id: string };
};

export async function PUT(request: Request, { params }: Params) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);

    const auth = await requireAdminApi(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const product = await prisma.product.update({
      where: { id: params.id },
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

    await prisma.product.delete({ where: { id: params.id } });
    await cacheDel("products:*");
    await cacheDel("featured:*");
    await cacheDel("category:*");

    return Response.json({ success: true });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

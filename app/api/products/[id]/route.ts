import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { cacheDel } from "@/lib/redis";
import { productSchema } from "@/lib/validators";
import { isValidCsrfRequest } from "@/lib/csrf";

type Params = {
  params: { id: string };
};

export async function PUT(request: Request, { params }: Params) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) return apiError(parsed.error.message, 422);

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

export async function DELETE(_request: Request, { params }: Params) {
  try {
    if (!isValidCsrfRequest(_request)) return apiError("Invalid CSRF origin", 403);

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 401);
    }

    await prisma.product.delete({ where: { id: params.id } });
    await cacheDel("products:*");
    await cacheDel("featured:*");
    await cacheDel("category:*");

    return Response.json({ success: true });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

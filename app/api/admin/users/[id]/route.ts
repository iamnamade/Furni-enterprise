import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { requireAdminApi } from "@/lib/admin-api";
import { adminUserRoleSchema, idParamSchema } from "@/lib/validators";
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
    if (!idParsed.success) return apiError("Invalid user id", 422);

    const body = await request.json();
    const parsed = adminUserRoleSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    if (auth.session.user.id === idParsed.data.id && parsed.data.role !== "ADMIN") {
      return apiError("You cannot remove your own admin access", 422);
    }

    if (parsed.data.role !== "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      const target = await prisma.user.findUnique({
        where: { id: idParsed.data.id },
        select: { role: true }
      });
      if (target?.role === "ADMIN" && adminCount <= 1) {
        return apiError("At least one admin account is required", 422);
      }
    }

    const user = await prisma.user.update({
      where: { id: idParsed.data.id },
      data: { role: parsed.data.role },
      select: { id: true, role: true, email: true, name: true, createdAt: true }
    });

    return Response.json(user);
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

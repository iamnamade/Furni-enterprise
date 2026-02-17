import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { requireAdminApi } from "@/lib/admin-api";
import { adminUserRoleSchema } from "@/lib/validators";
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
    const parsed = adminUserRoleSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    if (auth.session.user.id === params.id && parsed.data.role !== "ADMIN") {
      return apiError("You cannot remove your own admin access", 422);
    }

    if (parsed.data.role !== "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      const target = await prisma.user.findUnique({
        where: { id: params.id },
        select: { role: true }
      });
      if (target?.role === "ADMIN" && adminCount <= 1) {
        return apiError("At least one admin account is required", 422);
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role: parsed.data.role },
      select: { id: true, role: true, email: true, name: true, createdAt: true }
    });

    return Response.json(user);
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

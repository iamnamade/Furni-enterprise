import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { isValidCsrfRequest } from "@/lib/csrf";

const profileSchema = z.object({
  name: z.string().min(2).max(80)
});

export async function PATCH(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);

    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.message, 422);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
      select: { id: true, name: true, email: true }
    });

    return Response.json(user);
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function requireUser(locale = "ka") {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/${locale}/auth`);
  }
  return session.user;
}

export async function requireAdmin(locale = "ka") {
  const user = await requireUser(locale);
  if (user.role !== "ADMIN") {
    redirect(`/${locale}`);
  }
  return user;
}

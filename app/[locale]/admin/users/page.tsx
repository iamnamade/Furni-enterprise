import { prisma } from "@/lib/prisma";
import { UserManager } from "@/components/admin/user-manager";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  const initialUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString()
  }));

  return (
    <div className="space-y-4">
      <h1 className="section-title">Users</h1>
      <UserManager initialUsers={initialUsers} />
    </div>
  );
}


"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/lib/toast-store";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
};

export function UserManager({ initialUsers }: { initialUsers: AdminUser[] }) {
  const pushToast = useToastStore((state) => state.push);
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleRole(user: AdminUser) {
    setLoadingId(user.id);
    const role: UserRole = user.role === "ADMIN" ? "USER" : "ADMIN";

    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });

    setLoadingId(null);
    if (!response.ok) {
      pushToast({ title: "Role update failed", message: "Please try again." });
      return;
    }

    setUsers((state) => state.map((entry) => (entry.id === user.id ? { ...entry, role } : entry)));
    pushToast({ title: "Role updated", message: `${user.email} is now ${role}.` });
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-brand-primary/15">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead className="bg-brand-primary/8 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-brand-primary/10">
                <td className="px-4 py-3">{user.name || "-"}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(user.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Button variant="secondary" disabled={loadingId === user.id} onClick={() => toggleRole(user)}>
                    {loadingId === user.id ? "Saving..." : user.role === "ADMIN" ? "Set as USER" : "Set as ADMIN"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

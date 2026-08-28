import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { UserRole } from "@/app/generated/prisma/client";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireUser();

  if (!user.roles.includes(role)) {
    redirect("/unauthorized");
  }

  return user;
}

export async function requireAnyRole(roles: UserRole[]) {
  const user = await requireUser();

  const hasRole = roles.some((role) => user.roles.includes(role));

  if (!hasRole) {
    redirect("/unauthorized");
  }

  return user;
}
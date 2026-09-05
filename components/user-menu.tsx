"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { NotificationLink } from "./notification-link";

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (!session) {
    return (
      <div className="flex gap-3">
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      </div>
    );
  }

  async function handleLogout() {
    await authClient.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <NotificationLink />
      <span>{session.user.name}</span>

      <button onClick={handleLogout} className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600">
        Logout
      </button>
    </div>
  );
}
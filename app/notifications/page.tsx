import Link from "next/link";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "./actions";

export const dynamic =
  "force-dynamic";

export default async function NotificationsPage() {
  const user =
    await requireUser();

  const notifications =
    await prisma.notification.findMany({
      where: {
        userId:
          user.id,
      },

      orderBy: {
        createdAt:
          "desc",
      },

      take: 100,
    });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Notifications
          </h1>

          <p className="mt-2 text-muted-foreground">
            Order and delivery
            updates.
          </p>
        </div>

        {notifications.some(
          (notification) =>
            !notification.isRead
        ) && (
          <form
            action={
              markAllNotificationsRead
            }
          >
            <button className="text-sm">
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {notifications.length ===
      0 ? (
        <div className="mt-8 rounded-xl border p-10 text-center text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {notifications.map(
            (notification) => (
              <div
                key={
                  notification.id
                }
                className={`rounded-xl border p-5 ${
                  notification.isRead
                    ? ""
                    : "bg-muted/40"
                }`}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">
                      {
                        notification.title
                      }
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {
                        notification.message
                      }
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {notification.createdAt.toLocaleString()}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="h-2 w-2 shrink-0 rounded-full bg-foreground" />
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  {notification.href && (
                    <form
                      action={markNotificationRead.bind(
                        null,
                        notification.id
                      )}
                    >
                      <input
                        type="hidden"
                        name="href"
                        value={
                          notification.href
                        }
                      />

                      <button className="text-sm font-medium">
                        View
                      </button>
                    </form>
                  )}

                  {!notification.isRead &&
                    !notification.href && (
                      <form
                        action={markNotificationRead.bind(
                          null,
                          notification.id
                        )}
                      >
                        <button className="text-sm">
                          Mark as read
                        </button>
                      </form>
                    )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/"
          className="text-sm"
        >
          ← Back
        </Link>
      </div>
    </main>
  );
}
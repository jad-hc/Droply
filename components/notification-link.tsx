"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function NotificationLink() {
  const [unreadCount, setUnreadCount] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      try {
        const response = await fetch(
          "/api/notifications/unread-count",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (!cancelled) {
          setUnreadCount(
            data.unreadCount ?? 0
          );
        }
      } catch {
        // Keep current count if request fails.
      }
    }

    loadCount();

    const timer =
      window.setInterval(
        loadCount,
        5000
      );

    return () => {
      cancelled = true;

      window.clearInterval(
        timer
      );
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center"
    >
      Notifications

      {unreadCount > 0 && (
        <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
          {unreadCount > 99
            ? "99+"
            : unreadCount}
        </span>
      )}
    </Link>
  );
}
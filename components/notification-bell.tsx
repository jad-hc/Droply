"use client";

import Link from "next/link";

import {
  Bell,
  CheckCheck,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  href: string | null;
  type:
    | "ORDER"
    | "DELIVERY"
    | "SYSTEM";
  isRead: boolean;
  createdAt: string;
};

type NotificationResponse = {
  unreadCount: number;
  notifications: NotificationItem[];
};

function formatTime(
  dateString: string
) {
  const date =
    new Date(dateString);

  const diff =
    Date.now() -
    date.getTime();

  const minutes =
    Math.floor(
      diff / 60000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}

export function NotificationBell() {
  const router =
    useRouter();

  const [open, setOpen] =
    useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<
    NotificationItem[]
  >([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const wrapperRef =
    useRef<HTMLDivElement | null>(
      null
    );

  async function loadNotifications() {
    try {
      const response =
        await fetch(
          "/api/notifications/recent",
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        return;
      }

      const data =
        (await response.json()) as NotificationResponse;

      setNotifications(
        data.notifications
      );

      setUnreadCount(
        data.unreadCount
      );
    } catch (error) {
      console.error(
        "Unable to load notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();

    const timer =
      window.setInterval(
        () => {
          if (
            document.visibilityState ===
            "visible"
          ) {
            void loadNotifications();
          }
        },
        5000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function markAsRead(
    notification: NotificationItem
  ) {
    if (!notification.isRead) {
      try {
        await fetch(
          `/api/notifications/${notification.id}/read`,
          {
            method: "POST",
          }
        );

        setNotifications(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      isRead:
                        true,
                    }
                  : item
            )
        );

        setUnreadCount(
          (count) =>
            Math.max(
              0,
              count - 1
            )
        );
      } catch (error) {
        console.error(
          error
        );
      }
    }

    setOpen(false);

    if (
      notification.href
    ) {
      router.push(
        notification.href
      );
    }
  }

  async function markAllRead() {
    try {
      const response =
        await fetch(
          "/api/notifications/read-all",
          {
            method: "POST",
          }
        );

      if (!response.ok) {
        return;
      }

      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              isRead: true,
            })
          )
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount >
            99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className=" right-0 z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h2 className="font-semibold">
                Notifications
              </h2>

              {unreadCount >
                0 && (
                <p className="text-xs text-muted-foreground">
                  {
                    unreadCount
                  }{" "}
                  unread
                </p>
              )}
            </div>

            {unreadCount >
              0 && (
              <button
                type="button"
                onClick={
                  markAllRead
                }
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-4 w-4" />

                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm text-muted-foreground">
                  No notifications yet.
                </p>
              </div>
            ) : (
              notifications.map(
                (
                  notification
                ) => (
                  <button
                    type="button"
                    key={
                      notification.id
                    }
                    onClick={() =>
                      markAsRead(
                        notification
                      )
                    }
                    className={`block w-full border-b p-4 text-left transition last:border-b-0 hover:bg-muted/50 ${
                      !notification.isRead
                        ? "bg-muted/30"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium">
                            {
                              notification.title
                            }
                          </p>

                          {!notification.isRead && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {
                            notification.message
                          }
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatTime(
                            notification.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              )
            )}
          </div>

          <div className="border-t p-3">
            <Link
              href="/notifications"
              onClick={() =>
                setOpen(false)
              }
              className="block rounded-md py-2 text-center text-sm font-medium hover:bg-muted"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

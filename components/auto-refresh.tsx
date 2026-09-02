"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  interval?: number;
};

export function AutoRefresh({
  interval = 3000,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => {
      // Don't refresh when the user isn't viewing this tab.
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [interval, router]);

  return null;
}
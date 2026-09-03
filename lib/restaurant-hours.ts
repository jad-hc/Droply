import {
  DayOfWeek,
} from "@/app/generated/prisma/client";

type OpeningHour = {
  day: DayOfWeek;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

const DAY_MAP: Record<
  string,
  DayOfWeek
> = {
  Monday: DayOfWeek.MONDAY,
  Tuesday: DayOfWeek.TUESDAY,
  Wednesday: DayOfWeek.WEDNESDAY,
  Thursday: DayOfWeek.THURSDAY,
  Friday: DayOfWeek.FRIDAY,
  Saturday: DayOfWeek.SATURDAY,
  Sunday: DayOfWeek.SUNDAY,
};

function timeToMinutes(
  value: string
) {
  const [hours, minutes] =
    value.split(":").map(Number);

  return hours * 60 + minutes;
}

export function getRestaurantOpenStatus({
  openingHours,
  timezone,
  date = new Date(),
}: {
  openingHours: OpeningHour[];
  timezone: string;
  date?: Date;
}) {
  const formatter =
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

  const parts =
    formatter.formatToParts(date);

  const weekday =
    parts.find(
      (part) =>
        part.type === "weekday"
    )?.value;

  const hour =
    Number(
      parts.find(
        (part) =>
          part.type === "hour"
      )?.value ?? 0
    );

  const minute =
    Number(
      parts.find(
        (part) =>
          part.type === "minute"
      )?.value ?? 0
    );

  if (!weekday) {
    return {
      isOpen: false,
      reason:
        "Unable to determine restaurant hours.",
    };
  }

  const day =
    DAY_MAP[weekday];

  const hours =
    openingHours.find(
      (entry) =>
        entry.day === day
    );

  if (
    !hours ||
    hours.isClosed ||
    !hours.openTime ||
    !hours.closeTime
  ) {
    return {
      isOpen: false,
      reason: "Restaurant is closed today.",
    };
  }

  const nowMinutes =
    hour * 60 + minute;

  const openMinutes =
    timeToMinutes(
      hours.openTime
    );

  const closeMinutes =
    timeToMinutes(
      hours.closeTime
    );

  // Normal schedule:
  // 09:00 → 23:00
  if (
    closeMinutes >
    openMinutes
  ) {
    const isOpen =
      nowMinutes >=
        openMinutes &&
      nowMinutes <
        closeMinutes;

    return {
      isOpen,

      reason: isOpen
        ? null
        : `Restaurant is open from ${hours.openTime} to ${hours.closeTime}.`,
    };
  }

  // Overnight schedule:
  // 18:00 → 02:00
  const isOpen =
    nowMinutes >=
      openMinutes ||
    nowMinutes <
      closeMinutes;

  return {
    isOpen,

    reason: isOpen
      ? null
      : `Restaurant is open from ${hours.openTime} to ${hours.closeTime}.`,
  };
}
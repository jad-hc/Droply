import {
  DayOfWeek,
} from "@/app/generated/prisma/client";

import {
  updateOpeningHours,
} from "./opening-hours-actions";

type OpeningHour = {
  day: DayOfWeek;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

type Props = {
  restaurantId: string;
  openingHours: OpeningHour[];
};

const DAYS: {
  value: DayOfWeek;
  label: string;
}[] = [
  {
    value:
      DayOfWeek.MONDAY,
    label: "Monday",
  },
  {
    value:
      DayOfWeek.TUESDAY,
    label: "Tuesday",
  },
  {
    value:
      DayOfWeek.WEDNESDAY,
    label: "Wednesday",
  },
  {
    value:
      DayOfWeek.THURSDAY,
    label: "Thursday",
  },
  {
    value:
      DayOfWeek.FRIDAY,
    label: "Friday",
  },
  {
    value:
      DayOfWeek.SATURDAY,
    label: "Saturday",
  },
  {
    value:
      DayOfWeek.SUNDAY,
    label: "Sunday",
  },
];

export function OpeningHoursForm({
  restaurantId,
  openingHours,
}: Props) {
  const action =
    updateOpeningHours.bind(
      null,
      restaurantId
    );

  return (
    <form
      action={action}
      className="rounded-xl border p-6"
    >
      <div>
        <h2 className="text-xl font-semibold">
          Opening Hours
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Customers can only place
          orders while the
          restaurant is open.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {DAYS.map((day) => {
          const existing =
            openingHours.find(
              (hours) =>
                hours.day ===
                day.value
            );

          return (
            <div
              key={day.value}
              className="grid items-center gap-3 rounded-lg border p-4 md:grid-cols-[130px_1fr_1fr_auto]"
            >
              <strong>
                {day.label}
              </strong>

              <div>
                <label className="text-xs text-muted-foreground">
                  Opens
                </label>

                <input
                  type="time"
                  name={`${day.value}-open`}
                  defaultValue={
                    existing
                      ?.openTime ??
                    "09:00"
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">
                  Closes
                </label>

                <input
                  type="time"
                  name={`${day.value}-close`}
                  defaultValue={
                    existing
                      ?.closeTime ??
                    "23:00"
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={`${day.value}-closed`}
                  defaultChecked={
                    existing
                      ?.isClosed ??
                    false
                  }
                />

                Closed
              </label>
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        className="mt-6 rounded-md bg-foreground px-5 py-2 text-background"
      >
        Save Opening Hours
      </button>
    </form>
  );
}
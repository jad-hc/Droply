"use client";

import dynamic from "next/dynamic";

export const LocationPickerWrapper =
  dynamic(
    () =>
      import(
        "@/components/location-picker"
      ).then(
        (module) =>
          module.LocationPicker
      ),
    {
      ssr: false,
      loading: () => (
        <div className="flex h-[350px] items-center justify-center rounded-xl border">
          Loading map...
        </div>
      ),
    }
  );
"use client";

import dynamic from "next/dynamic";

export const DeliveryTrackingMapWrapper =
  dynamic(
    () =>
      import(
        "@/components/delivery-tracking-map"
      ).then(
        (module) =>
          module.DeliveryTrackingMap
      ),
    {
      ssr: false,

      loading: () => (
        <div className="flex h-[400px] items-center justify-center rounded-xl border">
          Loading tracking map...
        </div>
      ),
    }
  );
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

import { AddressForm } from "./address-form";
import {
  deleteAddress,
  setDefaultAddress,
} from "./actions";

export default async function AddressesPage() {
  const user = await requireUser();

  const addresses = await prisma.address.findMany({
    where: {
      userId: user.id,
    },

    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        Delivery Addresses
      </h1>

      <div className="mt-8">
        <AddressForm />
      </div>

      <div className="mt-10 space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="rounded-xl border p-5"
          >
            <div className="flex justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">
                    {address.label ?? "Address"}
                  </h2>

                  {address.isDefault && (
                    <span className="rounded bg-muted px-2 py-1 text-xs">
                      Default
                    </span>
                  )}
                </div>

                <p className="mt-2">
                  {address.addressLine}
                </p>

                <p className="text-sm text-muted-foreground">
                  {[
                    address.area,
                    address.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                {(address.building ||
                  address.floor ||
                  address.apartment) && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Building:{" "}
                    {address.building ?? "-"} · Floor:{" "}
                    {address.floor ?? "-"} · Apt:{" "}
                    {address.apartment ?? "-"}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {!address.isDefault && (
                  <form
                    action={setDefaultAddress.bind(
                      null,
                      address.id
                    )}
                  >
                    <button className="text-sm">
                      Make default
                    </button>
                  </form>
                )}

                <form
                  action={deleteAddress.bind(
                    null,
                    address.id
                  )}
                >
                  <button className="text-sm text-red-500">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="rounded-xl border p-8 text-center text-muted-foreground">
            No delivery addresses yet.
          </div>
        )}
      </div>
    </main>
  );
}
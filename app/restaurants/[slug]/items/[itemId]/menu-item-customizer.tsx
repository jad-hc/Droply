"use client";

import { useMemo, useState } from "react";

import { useCartStore } from "@/stores/cart-store";

type Option = {
  id: string;
  name: string;
  priceAdjustment: number;
};

type OptionGroup = {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: Option[];
};

type Props = {
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };

  item: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    price: number;
    optionGroups: OptionGroup[];
  };
};

export function MenuItemCustomizer({
  restaurant,
  item,
}: Props) {
  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, string[]>>({});

  const [quantity, setQuantity] = useState(1);

  function toggleOption(
    group: OptionGroup,
    optionId: string
  ) {
    setSelectedOptions((current) => {
      const selected =
        current[group.id] ?? [];

      const alreadySelected =
        selected.includes(optionId);

      if (group.maxSelect === 1) {
        return {
          ...current,
          [group.id]: alreadySelected
            ? []
            : [optionId],
        };
      }

      if (alreadySelected) {
        return {
          ...current,
          [group.id]: selected.filter(
            (id) => id !== optionId
          ),
        };
      }

      if (selected.length >= group.maxSelect) {
        return current;
      }

      return {
        ...current,
        [group.id]: [
          ...selected,
          optionId,
        ],
      };
    });
  }

  const optionsPrice = useMemo(() => {
    let total = 0;

    for (const group of item.optionGroups) {
      const selected =
        selectedOptions[group.id] ?? [];

      for (const option of group.options) {
        if (selected.includes(option.id)) {
          total += option.priceAdjustment;
        }
      }
    }

    return total;
  }, [
    item.optionGroups,
    selectedOptions,
  ]);

  const unitPrice =
    item.price + optionsPrice;

  const totalPrice =
    unitPrice * quantity;

  const isValid =
    item.optionGroups.every((group) => {
      const count =
        selectedOptions[group.id]?.length ?? 0;

      return (
        count >= group.minSelect &&
        count <= group.maxSelect
      );
    });

    const addItem = useCartStore(
  (state) => state.addItem
);

  function handleAddToCart() {
  if (!isValid) {
    return;
  }

  const selected: {
    id: string;
    name: string;
    priceAdjustment: number;
  }[] = [];

  for (const group of item.optionGroups) {
    const selectedIds =
      selectedOptions[group.id] ?? [];

    for (const option of group.options) {
      if (selectedIds.includes(option.id)) {
        selected.push({
          id: option.id,
          name: option.name,
          priceAdjustment:
            option.priceAdjustment,
        });
      }
    }
  }

  try {
    addItem({
      cartItemId: crypto.randomUUID(),

      restaurantId: restaurant.id,
      restaurantName: restaurant.name,

      menuItemId: item.id,

      name: item.name,
      image: item.image,

      basePrice: item.price,
      unitPrice,

      quantity,

      selectedOptions: selected,
    });

    alert("Added to cart.");
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
  }
}

  return (
    <div>
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="h-80 w-full rounded-xl object-cover"
        />
      )}

      <div className="mt-6">
        <h1 className="text-3xl font-bold">
          {item.name}
        </h1>

        {item.description && (
          <p className="mt-3 text-muted-foreground">
            {item.description}
          </p>
        )}

        <p className="mt-4 text-xl font-semibold">
          ${item.price.toFixed(2)}
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {item.optionGroups.map((group) => {
          const selected =
            selectedOptions[group.id] ?? [];

          return (
            <section
              key={group.id}
              className="rounded-xl border p-5"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="font-semibold">
                    {group.name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose {group.minSelect}
                    {group.maxSelect !==
                      group.minSelect &&
                      `–${group.maxSelect}`}
                  </p>
                </div>

                {group.required && (
                  <span className="text-xs font-medium">
                    Required
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {group.options.map((option) => {
                  const checked =
                    selected.includes(
                      option.id
                    );

                  return (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type={
                            group.maxSelect === 1
                              ? "radio"
                              : "checkbox"
                          }
                          name={group.id}
                          checked={checked}
                          onChange={() =>
                            toggleOption(
                              group,
                              option.id
                            )
                          }
                        />

                        <span>
                          {option.name}
                        </span>
                      </div>

                      {option.priceAdjustment >
                        0 && (
                        <span className="text-sm">
                          +$
                          {option.priceAdjustment.toFixed(
                            2
                          )}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            setQuantity((q) =>
              Math.max(1, q - 1)
            )
          }
          className="h-10 w-10 rounded-md border"
        >
          -
        </button>

        <span className="w-8 text-center font-semibold">
          {quantity}
        </span>

        <button
          type="button"
          onClick={() =>
            setQuantity((q) => q + 1)
          }
          className="h-10 w-10 rounded-md border"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!isValid}
        className="mt-8 w-full rounded-md bg-foreground px-5 py-3 font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add to cart · ${totalPrice.toFixed(2)}
      </button>
    </div>
  );
}
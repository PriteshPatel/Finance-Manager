"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "./utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "position-relative d-flex w-100 app-touch-none align-items-center user-select-none app-disabled radix-orientation radix-orientation radix-orientation radix-orientation",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-1 position-relative flex-grow-1 overflow-hidden rounded-pill radix-orientation radix-orientation radix-orientation radix-orientation",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary position-absolute radix-orientation radix-orientation",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-body  d-block app-size-4 flex-shrink-0 rounded-pill border shadow-sm app-transition app-hover-ring app-focus-ring app-focus-ring app-disabled app-disabled"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };

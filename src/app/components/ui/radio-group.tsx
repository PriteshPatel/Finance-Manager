"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";

import { cn } from "./utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "app-border-input fg-primary app-focus-ring app-focus-ring app-invalid app-invalid app-invalid app-dark-input app-aspect-square app-size-4 flex-shrink-0 rounded-pill border shadow-xs app-transition app-outline-none app-focus-ring app-disabled app-disabled",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="position-relative d-flex align-items-center justify-content-center"
      >
        <CircleIcon className="app-fill-primary position-absolute top-50 start-50 app-size-2 translate-middle-x translate-middle-y" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };

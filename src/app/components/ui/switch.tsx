"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "app-peer radix-checked radix-unchecked app-focus-ring app-focus-ring radix-unchecked d-inline-flex app-h-1-15rem w-8 flex-shrink-0 align-items-center rounded-pill border app-border-transparent app-transition app-outline-none app-focus-ring app-disabled app-disabled",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "app-bg-card radix-unchecked radix-checked pe-none d-block app-size-4 rounded-pill app-outline-none app-transition radix-checked radix-unchecked",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

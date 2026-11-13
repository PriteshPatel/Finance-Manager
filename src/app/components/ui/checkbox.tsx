"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "app-peer border app-bg-input app-dark-input radix-checked radix-checked radix-checked radix-checked app-focus-ring app-focus-ring app-invalid app-invalid app-invalid app-size-4 flex-shrink-0 rounded-1 border shadow-xs app-transition app-outline-none app-focus-ring app-disabled app-disabled",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="d-flex align-items-center justify-content-center fg-reset "
      >
        <CheckIcon className="app-size-3-5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

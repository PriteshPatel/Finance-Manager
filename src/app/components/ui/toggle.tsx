"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const toggleVariants = cva(
  "d-inline-flex align-items-center justify-content-center gap-2 rounded-2 text-sm fw-medium app-hover-muted app-hover-muted-foreground app-disabled app-disabled radix-on radix-on app-command-dialog app-command-dialog app-command-dialog app-focus-ring app-focus-ring app-focus-ring app-outline-none app-transition app-invalid app-invalid app-invalid text-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border app-border-input bg-transparent app-hover-accent app-hover-accent-foreground",
      },
      size: {
        default: "app-h-9 px-2 app-min-w-9",
        sm: "app-h-8 px-2 app-min-w-8",
        lg: "h-10 px-3 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };

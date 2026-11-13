"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "radix-open-motion radix-close-motion radix-close-motion radix-open-motion position-fixed app-inset-0 z-dialog app-bg-overlay",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-body radix-open-motion radix-close-motion position-fixed z-dialog d-flex flex-column gap-4 shadow-lg transition app-transition radix-close-motion radix-open-motion",
          side === "right" &&
            "radix-close-motion radix-open-motion app-inset-y-0 end-0 h-100 w-75 border-start app-sm-max-w-sm",
          side === "left" &&
            "radix-close-motion radix-open-motion app-inset-y-0 start-0 h-100 w-75 border-end app-sm-max-w-sm",
          side === "top" &&
            "radix-close-motion radix-open-motion app-inset-x-0 top-0 h-auto border-bottom",
          side === "bottom" &&
            "radix-close-motion radix-open-motion app-inset-x-0 bottom-0 h-auto border-top",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className=" app-focus-ring radix-open-secondary position-absolute app-top-4 app-end-4 rounded-1 opacity-75 app-transition app-hover-opacity app-focus-ring app-focus-ring app-focus-ring app-disabled">
          <XIcon className="app-size-4" />
          <span className="visually-hidden">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("d-flex flex-column gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto d-flex flex-column gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("fg-body fw-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("fg-2 text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "bg-body d-flex app-h-9 align-items-center gap-1 rounded-2 border p-1 shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  );
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "app-focus-accent app-focus-accent radix-open-accent radix-open-accent d-flex align-items-center rounded-1 px-2 py-1 text-sm fw-medium app-outline-none user-select-none",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "app-bg-popover fg-body radix-open-motion radix-close-motion radix-open-motion radix-close-motion radix-open-motion radix-open-motion radix-open-motion radix-open-motion radix-open-motion z-dialog app-min-w-12 app-menubar-origin overflow-hidden rounded-2 border p-1 shadow",
          className,
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "app-focus-accent app-focus-accent radix-destructive radix-destructive radix-destructive radix-destructive radix-destructive app-command-dialog position-relative d-flex app-cursor-default align-items-center gap-2 rounded-1 px-2 py-2 text-sm app-outline-none user-select-none app-disabled app-disabled radix-inset app-command-dialog app-command-dialog app-command-dialog",
        className,
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "app-focus-accent app-focus-accent position-relative d-flex app-cursor-default align-items-center gap-2 rounded-1 py-2 pe-2 ps-8 text-sm app-outline-none user-select-none app-disabled app-disabled app-command-dialog app-command-dialog app-command-dialog",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pe-none position-absolute app-start-2 d-flex app-size-3-5 align-items-center justify-content-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="app-size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "app-focus-accent app-focus-accent position-relative d-flex app-cursor-default align-items-center gap-2 rounded-1 py-2 pe-2 ps-8 text-sm app-outline-none user-select-none app-disabled app-disabled app-command-dialog app-command-dialog app-command-dialog",
        className,
      )}
      {...props}
    >
      <span className="pe-none position-absolute app-start-2 d-flex app-size-3-5 align-items-center justify-content-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="app-size-2 app-fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2 py-2 text-sm fw-medium radix-inset",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("app-bg-border app-negative-mx-1 my-1 app-h-px", className)}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "fg-2 ms-auto text-xs app-tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "app-focus-accent app-focus-accent radix-open-accent radix-open-accent d-flex app-cursor-default align-items-center rounded-1 px-2 py-2 text-sm app-outline-none user-select-none radix-inset",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto app-h-4 app-w-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "app-bg-popover fg-body radix-open-motion radix-close-motion radix-close-motion radix-open-motion radix-close-motion radix-open-motion radix-open-motion radix-open-motion radix-open-motion radix-open-motion z-dialog app-min-w-8 app-menubar-origin overflow-hidden rounded-2 border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};

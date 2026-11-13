import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "app-group-navigation position-relative d-flex app-max-w-max flex-fill align-items-center justify-content-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "app-group d-flex flex-fill list-unstyled align-items-center justify-content-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("position-relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "app-group d-inline-flex app-h-9 w-max align-items-center justify-content-center rounded-2 bg-body px-4 py-2 text-sm fw-medium app-hover-accent app-hover-accent-foreground app-focus-accent app-focus-accent app-disabled app-disabled radix-open-accent radix-open-accent radix-open-accent radix-open-accent app-focus-ring app-outline-none app-transition app-focus-ring app-focus-ring",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "app-group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="position-relative app-top-1px ms-1 app-size-3 transition  app-group-open-rotate"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "radix-open-motion radix-close-motion radix-open-motion radix-close-motion radix-open-motion radix-open-motion radix-close-motion radix-close-motion top-0 start-0 w-100 p-2 app-pe-2-5 app-md-position-absolute app-md-w-auto",
        "app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-inline app-nav-link-focus app-nav-link-focus",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "position-absolute app-top-full start-0 isolate z-dialog d-flex justify-content-center",
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "app-origin-top-center app-bg-popover fg-body radix-open-motion radix-close-motion radix-close-motion radix-open-motion position-relative mt-2 app-navigation-viewport-height w-100 overflow-hidden rounded-2 border shadow app-md-navigation-viewport-width",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "radix-active radix-active radix-active radix-active app-hover-accent app-hover-accent-foreground app-focus-accent app-focus-accent app-focus-ring app-command-dialog d-flex flex-column gap-1 rounded-1 p-2 text-sm app-transition app-outline-none app-focus-ring app-focus-ring app-command-dialog",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "radix-open-motion radix-close-motion radix-close-motion radix-open-motion app-top-full z-1 d-flex app-h-1-5 align-items-end justify-content-center overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="app-bg-border position-relative app-top-60 app-h-2 app-w-2 app-rotate-45 app-rounded-top-start shadow" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};

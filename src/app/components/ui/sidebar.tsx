"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";

import { useIsMobile } from "./use-mobile";
import { cn } from "./utils";
import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Skeleton } from "./skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // Keep the expanded/collapsed state available to the sidebar's Bootstrap styles.
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "app-sidebar-group app-sidebar-inset d-flex app-min-h-screen w-100",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "app-bg-sidebar fg-body d-flex h-100 app-sidebar-width flex-column",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="app-bg-sidebar fg-body app-sidebar-width p-0 app-command-dialog"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="visually-hidden">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="d-flex h-100 w-100 flex-column">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="app-group app-peer fg-body d-none md:d-block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "position-relative app-sidebar-width bg-transparent app-transition  app-transition",
          "app-sidebar-offcanvas",
          "app-sidebar-side",
          variant === "floating" || variant === "inset"
            ? "app-sidebar-collapsed-width"
            : "app-sidebar-collapsed-width",
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "position-fixed app-inset-y-0 z-1 d-none app-h-screen app-sidebar-width app-transition  app-transition md:d-flex",
          side === "left"
            ? "start-0 app-sidebar-offcanvas"
            : "end-0 app-sidebar-offcanvas",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 app-sidebar-collapsed-width"
            : "app-sidebar-collapsed-width app-sidebar-side app-sidebar-side",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="app-bg-sidebar app-sidebar-floating d-flex h-100 w-100 flex-column app-sidebar-floating app-sidebar-floating app-sidebar-floating"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("app-size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="visually-hidden">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "app-hover-after-sidebar position-absolute app-inset-y-0 z-2 d-none app-w-4 translate-middle-x app-transition app-transition app-sidebar-side app-sidebar-side app-after-style app-after-style app-after-style app-after-style sm:d-flex",
        "app-resize-cursor app-resize-cursor",
        "app-sidebar-rail-state app-sidebar-rail-state",
        "app-sidebar-hover-offcanvas app-sidebar-offcanvas app-sidebar-offcanvas",
        "app-sidebar-rail-state",
        "app-sidebar-rail-state",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-body position-relative d-flex w-100 flex-fill flex-column",
        "app-sidebar-inset app-sidebar-inset app-sidebar-inset app-sidebar-inset app-sidebar-inset-collapsed",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-body app-h-8 w-100 shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("d-flex flex-column gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("d-flex flex-column gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("app-bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "d-flex min-h-0 flex-fill flex-column gap-2 overflow-auto app-sidebar-collapsed-hide",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="app-group"
      className={cn("position-relative d-flex w-100 min-w-0 flex-column p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "fg-2 app-focus-ring d-flex app-h-8 flex-shrink-0 align-items-center rounded-2 px-2 text-xs fw-medium app-outline-none app-transition  app-transition app-focus-ring app-icon-size app-icon-size",
        "app-sidebar-collapsed-hide app-sidebar-collapsed-hide",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "fg-body app-focus-ring app-hover-sidebar app-hover-sidebar-foreground position-absolute app-top-3-5 app-end-3 d-flex app-aspect-square app-w-5 align-items-center justify-content-center rounded-2 p-0 app-outline-none app-transition app-focus-ring app-icon-size app-icon-size",
        // Increases the hit area of the button on mobile.
        "app-after-style app-after-style app-md-after-hidden",
        "app-sidebar-collapsed-hide",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-100 text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("d-flex w-100 min-w-0 flex-column gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("app-group-menu-item position-relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "app-sidebar-peer d-flex w-100 align-items-center gap-2 overflow-hidden rounded-2 p-2 text-start text-sm app-outline-none app-focus-ring app-transition app-hover-sidebar app-hover-sidebar-foreground app-focus-ring app-nav-active app-nav-active app-disabled app-disabled app-sidebar-action-padding app-disabled app-disabled radix-active radix-active radix-active radix-open-accent radix-open-accent app-sidebar-collapsed-compact app-sidebar-collapsed-compact app-sidebar-text app-icon-size app-icon-size",
  {
    variants: {
      variant: {
        default: "app-hover-sidebar app-hover-sidebar-foreground",
        outline:
          "bg-body app-sidebar-shadow app-hover-sidebar app-hover-sidebar-foreground app-sidebar-hover-shadow",
      },
      size: {
        default: "app-h-8 text-sm",
        sm: "app-h-7 text-xs",
        lg: "app-h-12 text-sm app-sidebar-collapsed-compact",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "fg-body app-focus-ring app-hover-sidebar app-hover-sidebar-foreground app-sidebar-active position-absolute app-top-1-5 app-end-1 d-flex app-aspect-square app-w-5 align-items-center justify-content-center rounded-2 p-0 app-outline-none app-transition app-focus-ring app-icon-size app-icon-size",
        // Increases the hit area of the button on mobile.
        "app-after-style app-after-style app-md-after-hidden",
        "app-sidebar-indicator",
        "app-sidebar-indicator",
        "app-sidebar-indicator",
        "app-sidebar-collapsed-hide",
        showOnHover &&
          "app-sidebar-active app-sidebar-reveal app-sidebar-reveal radix-open-motion app-md-opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "fg-body pe-none position-absolute app-end-1 d-flex app-h-5 app-min-w-5 align-items-center justify-content-center rounded-2 px-1 text-xs fw-medium app-tabular-nums user-select-none",
        "app-sidebar-active app-sidebar-active",
        "app-sidebar-indicator",
        "app-sidebar-indicator",
        "app-sidebar-indicator",
        "app-sidebar-collapsed-hide",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("d-flex app-h-8 align-items-center gap-2 rounded-2 px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="app-size-4 rounded-2"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="app-h-4 app-skeleton-max-width flex-fill"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-keyline app-mx-3-5 d-flex min-w-0 app-translate-x-px flex-column gap-1 border-start px-3 py-1",
        "app-sidebar-collapsed-hide",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("app-group-menu-item position-relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "fg-body app-focus-ring app-hover-sidebar app-hover-sidebar-foreground app-nav-active app-nav-active app-icon-sidebar d-flex app-h-7 min-w-0 app-negative-translate-x-px align-items-center gap-2 overflow-hidden rounded-2 px-2 app-outline-none app-focus-ring app-disabled app-disabled app-disabled app-disabled app-sidebar-text app-icon-size app-icon-size",
        "radix-active radix-active",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "app-sidebar-collapsed-hide",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

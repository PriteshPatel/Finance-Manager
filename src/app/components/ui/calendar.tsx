"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "d-flex flex-column sm:flex-row gap-2",
        month: "d-flex flex-column gap-4",
        caption: "d-flex justify-content-center pt-1 position-relative align-items-center w-100",
        caption_label: "text-sm fw-medium",
        nav: "d-flex align-items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "app-size-7 bg-transparent p-0 opacity-50 app-hover-opacity",
        ),
        nav_button_previous: "position-absolute app-start-1",
        nav_button_next: "position-absolute app-end-1",
        table: "w-100 app-border-collapse space-x-1",
        head_row: "d-flex",
        head_cell:
          "fg-2 rounded-2 w-8 fw-normal app-text-13",
        row: "d-flex w-100 mt-2",
        cell: cn(
          "position-relative p-0 text-center text-sm app-focus-within app-focus-within app-calendar-selected app-calendar-range-end",
          props.mode === "range"
            ? "app-calendar-range-end app-calendar-range-start app-calendar-first-selected app-calendar-last-selected"
            : "app-calendar-selected",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "app-size-8 p-0 fw-normal app-aria-selected",
        ),
        day_range_start:
          "day-range-start app-aria-selected app-aria-selected",
        day_range_end:
          "day-range-end app-aria-selected app-aria-selected",
        day_selected:
          "bg-primary fg-contrast-primary app-hover-primary app-hover-primary-foreground app-focus-primary app-focus-primary",
        day_today: "bg-accent fg-accent",
        day_outside:
          "day-outside fg-2 app-aria-selected",
        day_disabled: "fg-2 opacity-50",
        day_range_middle:
          "app-aria-selected app-aria-selected",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("app-size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("app-size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };

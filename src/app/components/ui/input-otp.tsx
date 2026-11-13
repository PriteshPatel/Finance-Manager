"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "./utils";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "d-flex align-items-center gap-2 app-disabled",
        containerClassName,
      )}
      className={cn("app-disabled", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("d-flex align-items-center gap-1", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "radix-active radix-active radix-invalid radix-invalid app-invalid radix-invalid app-dark-input app-border-input position-relative d-flex app-h-9 app-w-9 align-items-center justify-content-center border-y border-end text-sm app-bg-input app-transition app-outline-none app-first-child app-first-border app-last-child radix-active radix-active",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pe-none position-absolute app-inset-0 d-flex align-items-center justify-content-center">
          <div className="app-caret-blink bg-fg app-h-4 app-w-px " />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

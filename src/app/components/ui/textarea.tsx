import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "app-resize-none app-border-input app-placeholder app-focus-ring app-focus-ring app-invalid app-invalid app-invalid app-dark-input d-flex app-field-sizing app-min-h-16 w-100 rounded-2 border app-bg-input px-3 py-2 text-md app-transition app-outline-none app-focus-ring app-disabled app-disabled app-md-text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

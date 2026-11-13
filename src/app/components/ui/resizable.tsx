"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "./utils";

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "d-flex h-100 w-100 app-resize-vertical",
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "app-bg-border app-focus-ring position-relative d-flex app-w-px align-items-center justify-content-center app-after-style app-after-style app-after-style app-after-style app-after-style app-focus-ring app-focus-ring app-focus-ring app-resize-vertical app-resize-vertical app-resize-vertical app-resize-vertical app-resize-vertical app-resize-vertical app-resize-vertical app-resize-handle",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="app-bg-border z-1 d-flex app-h-4 app-w-3 align-items-center justify-content-center rounded-1 border">
          <GripVerticalIcon className="app-size-2-5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

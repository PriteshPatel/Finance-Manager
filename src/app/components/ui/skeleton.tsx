import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent app-pulse rounded-2", className)}
      {...props}
    />
  );
}

export { Skeleton };

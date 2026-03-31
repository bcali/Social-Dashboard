import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const valueVariants = cva("ui-value", {
  variants: {
    color: {
      primary: "text-[var(--color-primary)]",
      secondary: "text-[var(--color-secondary)]",
      success: "text-[var(--color-success)]",
      danger: "text-[var(--color-danger)]",
      warning: "text-[var(--color-warning)]",
      muted: "text-[var(--text-muted)]",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

interface ValueProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color">, VariantProps<typeof valueVariants> {}

export function Value({ className, color, children, ...props }: ValueProps) {
  return (
    <span className={cn(valueVariants({ color }), className)} {...props}>
      {children}
    </span>
  );
}

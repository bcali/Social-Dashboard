import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("ui-badge", {
  variants: {
    color: {
      primary: "ui-badge-primary",
      secondary: "ui-badge-secondary",
      success: "ui-badge-success",
      danger: "ui-badge-danger",
      warning: "ui-badge-warning",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, color, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ color }), className)} {...props}>
      {children}
    </span>
  );
}

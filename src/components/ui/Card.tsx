import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const cardVariants = cva("ui-card", {
  variants: {
    glow: {
      none: "",
      primary: "ui-glow",
      secondary: "ui-glow-secondary",
      danger: "ui-glow-danger",
      warning: "ui-glow-warning",
      success: "ui-glow-success",
    },
  },
  defaultVariants: {
    glow: "none",
  },
});

interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, glow, children, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ glow }), className)} {...props}>
      {children}
    </div>
  );
}

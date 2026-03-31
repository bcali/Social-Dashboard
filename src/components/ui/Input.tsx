import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const inputVariants = cva("ui-input", {
  variants: {
    size: {
      default: "py-2 px-3 text-sm",
      sm: "py-1.5 px-2 text-xs",
      lg: "py-2.5 px-4 text-base",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface InputProps extends Omit<React.ComponentProps<"input">, "size">, VariantProps<typeof inputVariants> {}

export function Input({ className, size, ...props }: InputProps) {
  return <input className={cn(inputVariants({ size }), className)} {...props} />;
}

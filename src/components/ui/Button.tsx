import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium font-mono transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] hover:shadow-[0_0_12px_var(--color-primary-dim)]",
        secondary:
          "bg-[var(--color-secondary-dim)] text-[var(--color-secondary)] border border-[color-mix(in_srgb,var(--color-secondary)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] hover:shadow-[0_0_12px_var(--color-secondary-dim)]",
        destructive:
          "bg-[var(--color-danger-dim)] text-[var(--color-danger)] border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] hover:shadow-[0_0_12px_var(--color-danger-dim)]",
        ghost: "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };

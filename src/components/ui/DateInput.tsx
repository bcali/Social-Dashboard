import * as React from "react";
import { cn } from "@/lib/utils";

interface DateInputProps extends Omit<React.ComponentProps<"input">, "type"> {}

export function DateInput({ className, ...props }: DateInputProps) {
  return (
    <input type="date" className={cn("ui-input py-1.5 px-2 text-xs", "[color-scheme:inherit]", className)} {...props} />
  );
}

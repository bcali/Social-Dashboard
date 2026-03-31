import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: ReactNode;
  className?: string;
}

export function Select({ value, onValueChange, placeholder, children, className }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        className={cn(
          "ui-input inline-flex items-center justify-between gap-2 py-1.5 px-3 text-sm w-auto cursor-pointer",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={14} className="text-[var(--text-muted)]" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="z-50 ui-card p-1 min-w-[8rem] overflow-hidden animate-in zoom-in-95 fade-in"
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      value={value}
      className={cn(
        "relative flex items-center rounded-sm px-2 py-1.5 text-sm text-[var(--text-primary)] cursor-pointer outline-none",
        "data-[highlighted]:bg-[var(--bg-hover)] data-[highlighted]:text-[var(--text-primary)]",
        className,
      )}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-auto">
        <Check size={14} className="text-[var(--color-primary)]" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

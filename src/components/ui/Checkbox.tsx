import * as Switch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, label, disabled, className }: CheckboxProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "w-8 h-[18px] rounded-full relative transition-colors",
          checked ? "bg-[var(--color-primary)]" : "bg-[var(--border)]",
        )}
      >
        <Switch.Thumb
          className={cn(
            "block w-3.5 h-3.5 rounded-full bg-white transition-transform",
            checked ? "translate-x-[15px]" : "translate-x-[2px]",
          )}
        />
      </Switch.Root>
      {label && <span className="text-sm text-[var(--text-secondary)]">{label}</span>}
    </label>
  );
}

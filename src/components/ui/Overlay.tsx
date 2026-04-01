import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  children: ReactNode;
  className?: string;
}

const MAX_WIDTH_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  full: "max-w-[95vw]",
};

export function Overlay({ open, onClose, title, maxWidth = "2xl", children, className }: OverlayProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />
        <Dialog.Content
          className={cn(
            "fixed inset-0 z-50 flex items-start justify-center p-8 overflow-y-auto",
            "animate-in zoom-in-95 fade-in",
          )}
        >
          <div className={cn("ui-card w-full p-6", MAX_WIDTH_MAP[maxWidth], className)}>
            <div className="flex items-center justify-between mb-4">
              {title && (
                <Dialog.Title className="text-lg font-semibold text-[var(--text-primary)]">{title}</Dialog.Title>
              )}
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-md hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

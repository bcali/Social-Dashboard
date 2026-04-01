import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: string;
  children: ReactNode;
  className?: string;
}

export function Drawer({ open, onClose, title, width = "480px", children, className }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 animate-in fade-in" />
        <Dialog.Content
          className={cn(
            "fixed right-0 top-0 bottom-0 z-50 bg-[var(--bg-card)] border-l border-[var(--border)] shadow-xl",
            "flex flex-col overflow-hidden",
            "animate-in slide-in-from-bottom-10",
            className,
          )}
          style={{ width }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            {title && <Dialog.Title className="text-lg font-semibold text-[var(--text-primary)]">{title}</Dialog.Title>}
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
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

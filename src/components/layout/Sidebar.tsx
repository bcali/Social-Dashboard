import type { LucideIcon } from "lucide-react";
import { LayoutDashboard } from "lucide-react";

export interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface SidebarProps {
  navItems: NavItem[];
  activeView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ navItems, activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-16 bg-[var(--brand-navy,var(--bg-secondary))] border-r border-[var(--brand-navy,var(--bg-secondary))] flex flex-col items-center py-4 space-y-6 z-10">
      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white mb-4">
        <LayoutDashboard size={18} />
      </div>

      <nav className="flex flex-col items-center space-y-2 flex-1">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`p-2.5 rounded-lg transition-all cursor-pointer ${
              activeView === id ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/10"
            }`}
            title={label}
            onClick={() => onNavigate(id)}
          >
            <Icon size={20} />
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
          <div className="w-full h-full bg-white/10" />
        </div>
      </div>
    </aside>
  );
}

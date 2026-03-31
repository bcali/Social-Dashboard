import type { ReactNode } from "react";
import { Header } from "./Header";
import { type NavItem, Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeView: string;
  onNavigate: (view: string) => void;
  title?: string;
  subtitle?: string;
}

export function Layout({ children, navItems, activeView, onNavigate, title, subtitle }: LayoutProps) {
  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden font-sans text-[var(--text-primary)]">
      <Sidebar navItems={navItems} activeView={activeView} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}

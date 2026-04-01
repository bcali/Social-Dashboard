interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Social Dashboard", subtitle = "Overview" }: HeaderProps) {
  return (
    <header className="h-14 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center px-6 shadow-sm z-10">
      <div className="flex items-center space-x-3 flex-1">
        <h1
          className="text-lg font-semibold text-[var(--brand-navy,var(--color-primary))]"
          style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
        >
          {title}
        </h1>
        <span className="text-[var(--text-muted)]">/</span>
        <span className="text-[var(--text-secondary)] text-sm">{subtitle}</span>
      </div>
    </header>
  );
}

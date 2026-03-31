import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary
      name="Application"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <div className="text-center p-8">
            <h1 className="text-xl font-bold text-[var(--color-danger)] mb-2">Something went wrong</h1>
            <p className="text-sm text-[var(--text-muted)] mb-4">The application encountered an unexpected error.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] rounded-lg hover:brightness-110 transition-all font-mono"
            >
              Reload
            </button>
          </div>
        </div>
      }
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

import React from "react";
import { Database, Bell, Settings, Search, Cpu, ShieldCheck } from "lucide-react";

export const Navbar: React.FC = () => {
  return (
    <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0 select-none">
      {/* Brand & Product Name */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-xs tracking-wider">
          RG
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-base tracking-tight font-sans">
            RAG<span className="text-primary">go</span>
          </span>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Enterprise Engine v1.0
          </span>
        </div>
      </div>

      {/* Center Search / Status Pill */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-subtle border border-border text-xs text-muted-foreground w-80 justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground/70" />
          <span className="text-muted-foreground/80">Search indexed documents...</span>
        </div>
        <kbd className="text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded border border-border text-muted-foreground">
          Ctrl K
        </kbd>
      </div>

      {/* Right Controls & Telemetry */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-mono text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Infinity Vector DB: Connected</span>
        </div>

        <div className="h-4 w-px bg-border" />

        <button
          className="hover:text-foreground hover:bg-muted p-1.5 rounded-md transition-colors"
          title="Audit & Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <button
          className="hover:text-foreground hover:bg-muted p-1.5 rounded-md transition-colors"
          title="System Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

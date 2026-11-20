import React from "react";
import { Shield, Bell, Settings, Database } from "lucide-react";

export const Navbar: React.FC = () => {
  return (
    <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
          AD
        </div>
        <div>
          <span className="font-semibold text-foreground text-sm tracking-tight">
            AegisDoc Intelligence
          </span>
          <span className="ml-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
            Enterprise RAG
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-status-success" />
          <span className="font-mono text-[11px]">Infinity Vector DB: Connected</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <button className="hover:text-foreground transition-colors p-1" title="Notifications">
          <Bell className="h-4 w-4" />
        </button>
        <button className="hover:text-foreground transition-colors p-1" title="Settings">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

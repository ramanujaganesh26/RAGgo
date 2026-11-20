import React from "react";
import { Database, Bell, Settings, Search, Terminal } from "lucide-react";

export const Navbar: React.FC = () => {
  return (
    <header className="h-13 border-b border-zinc-200 bg-white px-5 flex items-center justify-between shrink-0 select-none">
      {/* Brand & Workspace Name */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-md bg-zinc-900 flex items-center justify-center text-white font-semibold text-xs tracking-tight">
          RG
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-900 text-sm tracking-tight">
            RAGgo
          </span>
          <span className="text-[11px] text-zinc-400 font-normal">/</span>
          <span className="text-xs text-zinc-600 font-medium">
            Production Workspace
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 w-72 justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-zinc-400">Search documents...</span>
        </div>
        <kbd className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-500">
          Ctrl K
        </kbd>
      </div>

      {/* System Status & Utility Actions */}
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          <span className="font-mono text-[11px] text-zinc-600">Infinity DB Connected</span>
        </div>

        <div className="h-3.5 w-px bg-zinc-200" />

        <button
          className="hover:text-zinc-900 hover:bg-zinc-100 p-1.5 rounded-md transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <button
          className="hover:text-zinc-900 hover:bg-zinc-100 p-1.5 rounded-md transition-colors"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

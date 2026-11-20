import React from "react";
import { FolderGit2, BookCheck, Activity, Layers, Server } from "lucide-react";

interface SidebarProps {
  currentTab: "documents" | "chat" | "observability";
  onTabChange: (tab: "documents" | "chat" | "observability") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: "documents" as const, label: "Knowledge Collections", icon: FolderGit2 },
    { id: "chat" as const, label: "Multi-Document Chat", icon: BookCheck },
    { id: "observability" as const, label: "Ingestion Pipelines", icon: Activity },
  ];

  return (
    <aside className="w-56 border-r border-border bg-surface-subtle p-3 flex flex-col justify-between shrink-0">
      <nav className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-surface text-primary border border-border shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border border-border rounded-lg bg-surface text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Server className="h-3.5 w-3.5 text-primary" />
          <span>RAG Engine</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Powered by RAGFlow & DeepDoc layout understanding.
        </p>
      </div>
    </aside>
  );
};

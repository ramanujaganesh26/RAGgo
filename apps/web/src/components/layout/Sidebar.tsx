import React from "react";
import {
  FolderGit2,
  MessageSquareText,
  Activity,
  Layers,
  FileText,
  Server,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  currentTab: "documents" | "chat" | "observability";
  onTabChange: (tab: "documents" | "chat" | "observability") => void;
  documentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  documentCount = 7,
}) => {
  const mainNav = [
    {
      id: "documents" as const,
      label: "Knowledge Collections",
      icon: FolderGit2,
      badge: `${documentCount} docs`,
    },
    {
      id: "chat" as const,
      label: "Multi-Document Chat",
      icon: MessageSquareText,
      badge: "Grounded",
    },
    {
      id: "observability" as const,
      label: "Ingestion Pipelines",
      icon: Activity,
      badge: "Active",
      pulse: true,
    },
  ];

  return (
    <aside className="w-64 border-r border-border bg-surface-subtle p-3 flex flex-col justify-between shrink-0 select-none">
      <div className="space-y-4">
        {/* Workspace Organization Switcher */}
        <div className="px-2 pt-1">
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border shadow-2xs hover:border-border/80 transition-all cursor-pointer">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-foreground truncate">
                  Enterprise Core
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  Production RAG
                </div>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Intelligence Workspace
          </div>

          <nav className="space-y-1 mt-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-surface text-primary border border-border/80 shadow-xs"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    }`}
                  >
                    {item.pulse && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Enterprise Guardrails & Evals */}
        <div className="space-y-1 pt-1">
          <div className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Verification & Compliance
          </div>
          <div className="px-3 py-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Grounding Score</span>
              </span>
              <span className="font-mono font-semibold text-emerald-600 text-[11px]">
                98.4%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Layout Parser</span>
              </span>
              <span className="font-mono text-[11px] text-foreground font-medium">
                DeepDoc OCR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Telemetry Bottom Card */}
      <div className="space-y-2 pt-2">
        <div className="p-3 border border-border/80 rounded-xl bg-surface shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
              <Server className="h-3.5 w-3.5 text-primary" />
              <span>RAGgo Engine</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Online" />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Decoupled hybrid pipeline with Infinity Vector DB and DeepDoc table layout analysis.
          </p>
          <div className="pt-1 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span>Latency: 0.58ms</span>
            <span className="text-emerald-600 font-medium">100% Grounded</span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-2 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              RG
            </div>
            <div className="truncate">
              <div className="font-medium text-foreground text-[11px] truncate">
                Ramanuja Ganesh
              </div>
              <div className="text-[10px] text-muted-foreground truncate font-mono">
                Admin
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

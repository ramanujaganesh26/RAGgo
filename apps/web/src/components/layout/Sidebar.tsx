import React from "react";
import {
  FileText,
  FolderGit2,
  MessageSquare,
  Activity,
  Layers,
  ChevronRight,
  Database,
  Sliders,
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
      label: "Documents & Files",
      icon: FileText,
      badge: `${documentCount}`,
    },
    {
      id: "chat" as const,
      label: "Query Assistant",
      icon: MessageSquare,
      badge: null,
    },
    {
      id: "observability" as const,
      label: "Ingestion Telemetry",
      icon: Activity,
      badge: "Live",
    },
  ];

  return (
    <aside className="w-60 border-r border-zinc-200 bg-zinc-50/60 p-3 flex flex-col justify-between shrink-0 select-none">
      <div className="space-y-4">
        {/* Workspace Organization Switcher */}
        <div className="px-1">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white border border-zinc-200 shadow-2xs hover:border-zinc-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-5 w-5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center font-semibold text-[10px] shrink-0">
                <Layers className="h-3 w-3" />
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-zinc-900 truncate">
                  Corporate Policies
                </div>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-1">
          <div className="px-2.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Workspace
          </div>

          <nav className="space-y-0.5 mt-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-white text-zinc-900 border border-zinc-200/80 shadow-2xs"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isActive ? "text-zinc-900" : "text-zinc-400"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isActive
                          ? "bg-zinc-100 text-zinc-900 font-semibold"
                          : "text-zinc-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Collections Overview */}
        <div className="space-y-1 pt-1">
          <div className="px-2.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Active Collections
          </div>
          <div className="px-2.5 space-y-1 text-xs">
            <div className="flex items-center justify-between py-1 text-zinc-700">
              <span className="truncate">Corporate Policies</span>
              <span className="text-[10px] font-mono text-zinc-400">Default</span>
            </div>
            <div className="flex items-center justify-between py-1 text-zinc-500 hover:text-zinc-700 cursor-pointer">
              <span className="truncate">Financial Statements Q3</span>
              <span className="text-[10px] font-mono text-zinc-400">1 doc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System & Profile Status */}
      <div className="space-y-2 pt-2 border-t border-zinc-200/70">
        <div className="px-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            <span>Gateway 8000</span>
          </span>
          <span className="text-zinc-400">v1.0.0</span>
        </div>

        {/* User Card */}
        <div className="px-2 py-1 flex items-center justify-between text-xs rounded-md bg-white border border-zinc-200/70">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-5 w-5 rounded-full bg-zinc-800 text-white flex items-center justify-center font-medium text-[9px] shrink-0">
              RG
            </div>
            <div className="truncate">
              <div className="font-medium text-zinc-900 text-[11px] truncate">
                Ramanuja Ganesh
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Admin</span>
        </div>
      </div>
    </aside>
  );
};

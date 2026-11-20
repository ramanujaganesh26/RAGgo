import React, { useState } from "react";
import { Citation } from "@/types";
import { FileText, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";

interface CitationCardProps {
  citation: Citation;
  onSelect?: (citation: Citation) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-zinc-200 rounded-md bg-white text-xs overflow-hidden">
      {/* Header Row */}
      <div
        onClick={() => onSelect?.(citation)}
        className="px-2.5 py-1.5 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-2 truncate max-w-[210px]">
          <span className="font-mono text-[10px] text-zinc-500 font-semibold shrink-0">
            [{citation.citation_id}]
          </span>
          <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span className="truncate text-[11px] text-zinc-800 font-medium">
            {citation.document_name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-zinc-400">
          {citation.page_number && (
            <span>p.{citation.page_number}</span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
            title={expanded ? "Hide snippet" : "Show snippet"}
          >
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Snippet */}
      {expanded && (
        <div className="px-2.5 py-2 border-t border-zinc-100 bg-zinc-50/60">
          <p className="text-zinc-600 text-[11px] leading-relaxed italic select-text">
            &ldquo;{citation.snippet}&rdquo;
          </p>
          <div className="mt-1 flex justify-end">
            <button
              onClick={() => onSelect?.(citation)}
              className="text-[10px] text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-0.5"
            >
              View Document
              <ArrowUpRight className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

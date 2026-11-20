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
    <div className="group border border-border/80 rounded-lg bg-surface hover:border-primary/50 transition-all text-xs overflow-hidden shadow-2xs">
      {/* Top Header Row */}
      <div
        onClick={() => onSelect?.(citation)}
        className="p-2 flex items-center justify-between cursor-pointer hover:bg-surface-subtle/50 transition-colors"
      >
        <div className="flex items-center gap-2 truncate max-w-[210px]">
          <span className="inline-flex items-center justify-center h-4 w-4 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold shrink-0">
            {citation.citation_id}
          </span>
          <FileText className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
          <span className="truncate font-medium text-[11px] text-foreground">
            {citation.document_name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {citation.page_number && (
            <span className="text-[10px] font-mono text-muted-foreground bg-surface-subtle border border-border px-1.5 py-0.2 rounded">
              p.{citation.page_number}
            </span>
          )}
          <span className="text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
            {(citation.relevance_score * 100).toFixed(0)}%
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground transition-colors"
            title={expanded ? "Hide snippet" : "Preview snippet"}
          >
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Evidence Snippet */}
      {expanded && (
        <div className="px-2.5 pb-2 pt-1 border-t border-border/50 bg-surface-subtle/30">
          <p className="text-muted-foreground text-[11px] leading-relaxed italic font-sans select-text">
            &ldquo;{citation.snippet}&rdquo;
          </p>
          <div className="mt-1.5 flex justify-end">
            <button
              onClick={() => onSelect?.(citation)}
              className="text-[10px] font-medium text-primary hover:underline inline-flex items-center gap-0.5"
            >
              Open in Document Viewer
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

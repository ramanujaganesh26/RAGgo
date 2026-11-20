import React from "react";
import { Citation } from "@/types";
import { FileText, ArrowUpRight } from "lucide-react";

interface CitationCardProps {
  citation: Citation;
  onSelect?: (citation: Citation) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onSelect }) => {
  return (
    <div
      onClick={() => onSelect?.(citation)}
      className="group p-2.5 bg-surface border border-border/80 rounded-lg hover:border-primary/60 hover:shadow-xs transition-all cursor-pointer text-xs"
    >
      <div className="flex items-center justify-between font-medium text-foreground mb-1">
        <div className="flex items-center gap-1.5 truncate max-w-[240px]">
          <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-semibold shrink-0">
            {citation.citation_id}
          </span>
          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate font-semibold text-[11px] text-foreground">
            {citation.document_name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {citation.page_number && (
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              p. {citation.page_number}
            </span>
          )}
          <span className="text-[10px] font-mono font-medium text-status-success">
            {(citation.relevance_score * 100).toFixed(0)}%
          </span>
          <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>

      <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed italic bg-surface-subtle/60 p-1.5 rounded border border-border/40 mt-1">
        &ldquo;{citation.snippet}&rdquo;
      </p>
    </div>
  );
};

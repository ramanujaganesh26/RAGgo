import React from "react";
import { Citation } from "@/types";
import { BookOpen } from "lucide-react";

interface CitationCardProps {
  citation: Citation;
  onSelect?: (citation: Citation) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onSelect }) => {
  return (
    <div
      onClick={() => onSelect?.(citation)}
      className="p-3 bg-surface-subtle border border-border rounded-md hover:border-primary/50 transition-colors cursor-pointer text-xs"
    >
      <div className="flex items-center justify-between font-medium text-foreground mb-1">
        <span className="flex items-center gap-1.5 text-primary">
          <BookOpen className="h-3.5 w-3.5" />
          [{citation.citation_id}] {citation.document_name}
        </span>
        {citation.page_number && (
          <span className="text-[11px] font-mono text-muted-foreground">
            p. {citation.page_number}
          </span>
        )}
      </div>
      <p className="text-muted-foreground line-clamp-2 italic leading-relaxed">
        &ldquo;{citation.snippet}&rdquo;
      </p>
      <div className="mt-1.5 text-[10px] text-muted-foreground/75 font-mono">
        Relevance: {(citation.relevance_score * 100).toFixed(0)}%
      </div>
    </div>
  );
};

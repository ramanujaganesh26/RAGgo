import React from "react";
import { Citation } from "@/types";
import { X, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "../common/Button";

interface SourceViewerModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground text-sm">
              Source Passage [{citation.citation_id}]
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              &middot; {citation.document_name}
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between text-muted-foreground border-b border-border pb-3">
            <span>
              Document ID: <code className="text-foreground">{citation.document_id}</code>
            </span>
            {citation.page_number && (
              <span className="font-mono">Reference Page: {citation.page_number}</span>
            )}
            <span className="font-mono text-status-success">
              Relevance: {(citation.relevance_score * 100).toFixed(1)}%
            </span>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/60 rounded-md p-4 text-foreground text-xs leading-relaxed">
            <span className="text-[10px] uppercase font-semibold text-amber-800 tracking-wider block mb-1">
              Exact Extracted Passage
            </span>
            &ldquo;{citation.snippet}&rdquo;
          </div>

          <p className="text-[11px] text-muted-foreground">
            Extracted and verified via RAGFlow DeepDoc vision layout parser.
          </p>
        </div>

        <div className="px-5 py-3 border-t border-border bg-surface-subtle flex justify-end">
          <Button size="sm" onClick={onClose}>
            Close Inspection
          </Button>
        </div>
      </div>
    </div>
  );
};

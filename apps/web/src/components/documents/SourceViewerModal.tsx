import React, { useState } from "react";
import { Citation } from "@/types";
import { X, ShieldCheck, Copy, Check, FileText } from "lucide-react";
import { Button } from "../common/Button";

interface SourceViewerModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({ citation, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-semibold">
              {citation.citation_id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-xs">
                  {citation.document_name}
                </span>
                {citation.page_number && (
                  <span className="text-[10px] font-mono text-muted-foreground bg-surface border border-border px-1.5 py-0.5 rounded">
                    Page {citation.page_number}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">
                Verified Document Evidence
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between text-muted-foreground border-b border-border pb-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Document Identifier: <code className="text-foreground font-mono">{citation.document_id}</code>
            </span>
            <span className="font-mono text-status-success font-medium">
              Relevance: {(citation.relevance_score * 100).toFixed(0)}%
            </span>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-foreground text-xs leading-relaxed">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-semibold text-primary tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Extracted Passage
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-surface border border-border/60"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-status-success" />
                    <span className="text-status-success font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap">
              &ldquo;{citation.snippet}&rdquo;
            </p>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Extracted, indexed, and grounded via DeepDoc layout-aware semantic segmenter.
          </p>
        </div>

        <div className="px-5 py-3 border-t border-border bg-surface-subtle flex justify-end">
          <Button size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};

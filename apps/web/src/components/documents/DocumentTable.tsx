import React from "react";
import { DocumentItem } from "@/types";
import { StageIndicator } from "./StageIndicator";
import { FileText, FileSpreadsheet, RotateCcw, Trash2, Eye, CheckCircle2 } from "lucide-react";

interface DocumentTableProps {
  documents: DocumentItem[];
  onReprocess: (docId: string) => void;
  onDelete: (docId: string) => void;
  onViewSource?: (doc: DocumentItem) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onReprocess,
  onDelete,
  onViewSource,
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileBadge = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      return (
        <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
          <FileText className="h-4 w-4" />
        </div>
      );
    }
    if (ext === "xlsx" || ext === "csv") {
      return (
        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
          <FileSpreadsheet className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
        <FileText className="h-4 w-4" />
      </div>
    );
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border/80 rounded-xl bg-surface-subtle/50">
        <FileText className="mx-auto h-9 w-9 text-muted-foreground/60 stroke-1" />
        <h4 className="mt-2.5 text-sm font-semibold text-foreground">No documents in this collection</h4>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Upload PDF, DOCX, or Excel documents to begin visual layout analysis and vector indexing.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-border/80 rounded-xl bg-surface shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-subtle/80 border-b border-border text-muted-foreground font-medium text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Document</th>
              <th className="py-3 px-3 font-semibold">Size</th>
              <th className="py-3 px-3 font-semibold text-center">Pages</th>
              <th className="py-3 px-3 font-semibold text-center">Chunks</th>
              <th className="py-3 px-4 font-semibold min-w-[140px]">Pipeline Stage</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-surface-subtle/60 transition-colors group"
              >
                {/* Document Name and Metadata */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {getFileBadge(doc.filename)}
                    <div className="min-w-0 max-w-[260px]">
                      <div
                        className="font-medium text-foreground truncate text-xs cursor-pointer hover:text-primary transition-colors"
                        title={doc.filename}
                        onClick={() => onViewSource?.(doc)}
                      >
                        {doc.filename}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        DeepDoc Segmented
                      </div>
                    </div>
                  </div>
                </td>

                {/* File Size */}
                <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                  {formatBytes(doc.file_size_bytes)}
                </td>

                {/* Pages */}
                <td className="py-3 px-3 text-muted-foreground font-mono text-center text-[11px]">
                  {doc.metadata.page_count ?? "1"}
                </td>

                {/* Chunks */}
                <td className="py-3 px-3 text-muted-foreground font-mono text-center text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border">
                    {doc.metadata.chunk_count}
                  </span>
                </td>

                {/* Processing Stage */}
                <td className="py-3 px-4">
                  <StageIndicator stage={doc.stage} progress={doc.progress_percentage} />
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onReprocess(doc.id)}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Reprocess Pipeline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-1.5 rounded-md hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors"
                      title="Remove from Collection"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

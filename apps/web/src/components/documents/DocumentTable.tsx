import React from "react";
import { DocumentItem } from "@/types";
import { StageIndicator } from "./StageIndicator";
import { Button } from "../common/Button";
import { FileText, RotateCcw, Trash2 } from "lucide-react";

interface DocumentTableProps {
  documents: DocumentItem[];
  onReprocess: (docId: string) => void;
  onDelete: (docId: string) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onReprocess,
  onDelete,
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg bg-surface-subtle">
        <FileText className="mx-auto h-8 w-8 text-muted-foreground stroke-1" />
        <h4 className="mt-2 text-sm font-semibold text-foreground">No documents in collection</h4>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Upload PDF, DOCX, or text files to begin layout extraction and vector indexing.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-surface-subtle border-b border-border text-muted-foreground font-medium">
            <th className="py-2.5 px-4">Document</th>
            <th className="py-2.5 px-3">Size</th>
            <th className="py-2.5 px-3">Pages</th>
            <th className="py-2.5 px-3">Chunks</th>
            <th className="py-2.5 px-3 min-w-[140px]">Processing Stage</th>
            <th className="py-2.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-surface-subtle/50 transition-colors">
              <td className="py-3 px-4 font-medium text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate max-w-[220px]" title={doc.filename}>
                  {doc.filename}
                </span>
              </td>
              <td className="py-3 px-3 text-muted-foreground">{formatBytes(doc.file_size_bytes)}</td>
              <td className="py-3 px-3 text-muted-foreground font-mono">
                {doc.metadata.page_count ?? "—"}
              </td>
              <td className="py-3 px-3 text-muted-foreground font-mono">
                {doc.metadata.chunk_count}
              </td>
              <td className="py-3 px-3">
                <StageIndicator stage={doc.stage} progress={doc.progress_percentage} />
              </td>
              <td className="py-3 px-4 text-right">
                <div className="inline-flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReprocess(doc.id)}
                    title="Reprocess document"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(doc.id)}
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-status-error" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

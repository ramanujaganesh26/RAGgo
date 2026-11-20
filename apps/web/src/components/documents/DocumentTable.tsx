import React from "react";
import { DocumentItem } from "@/types";
import { StageIndicator } from "./StageIndicator";
import { FileText, RotateCcw, Trash2 } from "lucide-react";

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

  if (documents.length === 0) {
    return (
      <div className="text-center py-14 border border-zinc-200 rounded-lg bg-zinc-50/50">
        <FileText className="mx-auto h-7 w-7 text-zinc-400 stroke-1" />
        <h4 className="mt-2 text-xs font-medium text-zinc-900">No documents found</h4>
        <p className="mt-0.5 text-xs text-zinc-500 max-w-sm mx-auto">
          Upload PDF, DOCX, or text files to index them into this collection.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-medium text-[11px]">
              <th className="py-2.5 px-3.5 font-medium">Name</th>
              <th className="py-2.5 px-3 font-medium">Size</th>
              <th className="py-2.5 px-3 font-medium text-center">Chunks</th>
              <th className="py-2.5 px-3 font-medium">Status</th>
              <th className="py-2.5 px-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-zinc-50/80 transition-colors group"
              >
                {/* Document Name */}
                <td className="py-2.5 px-3.5">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span
                      className="font-medium text-zinc-900 truncate max-w-[240px] cursor-pointer hover:underline"
                      title={doc.filename}
                      onClick={() => onViewSource?.(doc)}
                    >
                      {doc.filename}
                    </span>
                  </div>
                </td>

                {/* File Size */}
                <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                  {formatBytes(doc.file_size_bytes)}
                </td>

                {/* Chunks */}
                <td className="py-2.5 px-3 text-zinc-600 font-mono text-center text-[11px]">
                  {doc.metadata.chunk_count}
                </td>

                {/* Status Indicator */}
                <td className="py-2.5 px-3">
                  <StageIndicator stage={doc.stage} progress={doc.progress_percentage} />
                </td>

                {/* Actions */}
                <td className="py-2.5 px-3 text-right">
                  <div className="inline-flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onReprocess(doc.id)}
                      className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                      title="Reprocess"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
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

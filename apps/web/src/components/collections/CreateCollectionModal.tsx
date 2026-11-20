import React, { useState } from "react";
import { Button } from "../common/Button";
import { X, Layers } from "lucide-react";
import { ParsingTemplate } from "@/types";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (collection: any) => void;
}

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<ParsingTemplate>("general");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    const newCol = {
      id: `col-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      parsing_template: template,
      embedding_model: "BAAI/bge-large-en-v1.5",
      document_count: 0,
      chunk_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await fetch("/api/v1/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCol),
      });
    } catch (e) {
      // Local offline fallback
    }

    onCreated(newCol);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">New Knowledge Collection</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">Collection Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Legal Contracts 2026"
              className="w-full h-9 px-3 bg-surface-subtle border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the documents in this repository..."
              className="w-full p-2.5 bg-surface-subtle border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">DeepDoc Parsing Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as ParsingTemplate)}
              className="w-full h-9 px-2 bg-surface-subtle border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="general">General (Standard Document Segmentation)</option>
              <option value="law">Legal (Clauses, Precedents & Sections)</option>
              <option value="table">Tabular / Financial (Spreadsheets & Balance Sheets)</option>
              <option value="manual">Technical Manual (Step-by-Step Procedures)</option>
              <option value="paper">Academic Paper (Dual-Column Layout)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isLoading} disabled={!name.trim()}>
              Create Collection
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

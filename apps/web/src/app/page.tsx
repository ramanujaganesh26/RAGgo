"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { UploadModal } from "@/components/documents/UploadModal";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { SourceViewerModal } from "@/components/documents/SourceViewerModal";
import { useDocumentStages } from "@/hooks/useDocumentStages";
import { DocumentItem, Citation, Collection } from "@/types";
import { Upload, Plus, RefreshCw, FolderPlus } from "lucide-react";

export default function WorkspacePage() {
  const [currentTab, setCurrentTab] = useState<"documents" | "chat" | "observability">("documents");

  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "col-01",
      name: "Corporate Policies & Architecture",
      description: "Enterprise system design, coding standards and policies",
      parsing_template: "general",
      embedding_model: "BAAI/bge-large-en-v1.5",
      document_count: 3,
      chunk_count: 128,
      created_at: "2026-11-20T08:00:00Z",
      updated_at: "2026-11-20T08:00:00Z",
    },
    {
      id: "col-02",
      name: "Financial Statements Q3",
      description: "Quarterly balance sheets, P&L and auditing reports",
      parsing_template: "table",
      embedding_model: "BAAI/bge-large-en-v1.5",
      document_count: 1,
      chunk_count: 42,
      created_at: "2026-11-20T08:30:00Z",
      updated_at: "2026-11-20T08:30:00Z",
    },
  ]);

  const [activeCollectionId, setActiveCollectionId] = useState("col-01");
  const activeCollection =
    collections.find((c) => c.id === activeCollectionId) || collections[0];

  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: "doc-001",
      collection_id: "col-01",
      filename: "Enterprise_Architecture_Spec.pdf",
      file_type: "application/pdf",
      file_size_bytes: 2458120,
      stage: "completed",
      progress_percentage: 100,
      metadata: {
        filename: "Enterprise_Architecture_Spec.pdf",
        file_type: "application/pdf",
        file_size_bytes: 2458120,
        page_count: 24,
        chunk_count: 86,
      },
      created_at: "2026-11-20T08:00:00Z",
      updated_at: "2026-11-20T08:02:15Z",
    },
    {
      id: "doc-002",
      collection_id: "col-01",
      filename: "Q3_Financial_Audits_Table.xlsx",
      file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      file_size_bytes: 1120400,
      stage: "completed",
      progress_percentage: 100,
      metadata: {
        filename: "Q3_Financial_Audits_Table.xlsx",
        file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        file_size_bytes: 1120400,
        page_count: 5,
        chunk_count: 42,
      },
      created_at: "2026-11-20T08:05:00Z",
      updated_at: "2026-11-20T08:06:20Z",
    },
  ]);

  // Real-time SSE stage listener for background processing documents
  useDocumentStages(documents, setDocuments);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateColOpen, setIsCreateColOpen] = useState(false);
  const [inspectedCitation, setInspectedCitation] = useState<Citation | null>(null);

  const handleReprocess = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, stage: "parsing", progress_percentage: 30 } : doc
      )
    );
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleUploadSuccess = (newDocs: DocumentItem[]) => {
    setDocuments((prev) => [...newDocs, ...prev]);
  };

  const handleCollectionCreated = (newCol: Collection) => {
    setCollections((prev) => [...prev, newCol]);
    setActiveCollectionId(newCol.id);
  };

  const currentDocs = documents.filter((d) => d.collection_id === activeCollectionId);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

        <main className="flex-1 p-6 overflow-y-auto bg-surface-subtle/40">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Workspace Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <select
                    value={activeCollectionId}
                    onChange={(e) => setActiveCollectionId(e.target.value)}
                    className="text-lg font-bold bg-transparent border-b border-dashed border-border hover:border-primary text-foreground focus:outline-none cursor-pointer pr-4"
                  >
                    {collections.map((col) => (
                      <option key={col.id} value={col.id} className="bg-surface text-foreground text-sm">
                        {col.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreateColOpen(true)}
                    title="Create new collection"
                  >
                    <FolderPlus className="h-4 w-4 text-primary" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeCollection.description || "Multi-document knowledge repository with DeepDoc layout segmentation."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateColOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  New Collection
                </Button>
                <Button size="sm" onClick={() => setIsUploadOpen(true)}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload Documents
                </Button>
              </div>
            </div>

            {/* Main Content Area */}
            {currentTab === "documents" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card
                    title="Indexed Documents"
                    subtitle={`Tracking ${currentDocs.length} document(s) in active collection`}
                    action={
                      <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(true)}>
                        <Upload className="h-3 w-3 mr-1" /> Upload
                      </Button>
                    }
                  >
                    <DocumentTable
                      documents={currentDocs}
                      onReprocess={handleReprocess}
                      onDelete={handleDelete}
                    />
                  </Card>
                </div>

                <div className="h-[650px]">
                  <ChatPanel
                    selectedCollectionName={activeCollection.name}
                    selectedCollectionId={activeCollection.id}
                    onCitationClick={(cit) => setInspectedCitation(cit)}
                  />
                </div>
              </div>
            )}

            {currentTab === "chat" && (
              <div className="h-[750px]">
                <ChatPanel
                  selectedCollectionName={activeCollection.name}
                  selectedCollectionId={activeCollection.id}
                  onCitationClick={(cit) => setInspectedCitation(cit)}
                />
              </div>
            )}

            {currentTab === "observability" && (
              <Card
                title="DeepDoc Ingestion Pipeline Telemetry"
                subtitle="Live status from RAGFlow and Infinity Vector Engine"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border border-border rounded-lg bg-surface">
                    <span className="text-xs text-muted-foreground">Active Processing Tasks</span>
                    <div className="text-2xl font-bold text-foreground mt-1">
                      {documents.filter((d) => d.stage !== "completed" && d.stage !== "failed").length}
                    </div>
                    <span className="text-[11px] text-primary">Real-time SSE connected</span>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-surface">
                    <span className="text-xs text-muted-foreground">Total Chunks Stored</span>
                    <div className="text-2xl font-bold text-foreground mt-1">
                      {documents.reduce((acc, d) => acc + (d.metadata.chunk_count || 0), 0)}
                    </div>
                    <span className="text-[11px] text-status-success font-mono">100% Vectorized</span>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-surface">
                    <span className="text-xs text-muted-foreground">Vector Database</span>
                    <div className="text-2xl font-bold text-foreground mt-1">Infinity DB</div>
                    <span className="text-[11px] text-muted-foreground font-mono">Dense + Sparse BM25</span>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-surface">
                    <span className="text-xs text-muted-foreground">Parsing Architecture</span>
                    <div className="text-2xl font-bold text-foreground mt-1">DeepDoc CV</div>
                    <span className="text-[11px] text-status-success font-mono">Table Aware</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        collectionId={activeCollection.id}
      />

      {/* Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateColOpen}
        onClose={() => setIsCreateColOpen(false)}
        onCreated={handleCollectionCreated}
      />

      {/* Source Inspection Drawer */}
      <SourceViewerModal
        citation={inspectedCitation}
        onClose={() => setInspectedCitation(null)}
      />
    </div>
  );
}

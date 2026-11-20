"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { UploadModal } from "@/components/documents/UploadModal";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { SourceViewerModal } from "@/components/documents/SourceViewerModal";
import { useDocumentStages } from "@/hooks/useDocumentStages";
import { DocumentItem, Citation, Collection } from "@/types";
import {
  Upload,
  Plus,
  RefreshCw,
  FolderPlus,
  Search,
  Filter,
  Layers,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function WorkspacePage() {
  const [currentTab, setCurrentTab] = useState<"documents" | "chat" | "observability">("documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [fileFilter, setFileFilter] = useState<"all" | "pdf" | "sheets">("all");

  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "col-01",
      name: "Corporate Policies & Architecture",
      description: "Enterprise system design, coding standards and resume knowledge base",
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

  // Load actual backend indexed documents on mount
  useEffect(() => {
    fetch("/api/v1/documents")
      .then((res) => (res.ok ? res.json() : []))
      .then((serverDocs: DocumentItem[]) => {
        if (serverDocs && serverDocs.length > 0) {
          setDocuments((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            const newOnes = serverDocs.filter((d) => !existingIds.has(d.id));
            return [...newOnes, ...prev];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Real-time SSE stage listener for background processing documents
  useDocumentStages(documents, setDocuments);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateColOpen, setIsCreateColOpen] = useState(false);
  const [inspectedCitation, setInspectedCitation] = useState<Citation | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/v1/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch {
      // keep current state
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

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

  // Filter documents by search and file type
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (fileFilter === "pdf") return doc.filename.toLowerCase().endsWith(".pdf");
    if (fileFilter === "sheets") {
      const lower = doc.filename.toLowerCase();
      return lower.endsWith(".xlsx") || lower.endsWith(".csv") || lower.endsWith(".xls");
    }
    return true;
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          documentCount={documents.length}
        />

        <main className="flex-1 p-5 sm:p-6 overflow-y-auto bg-surface-subtle/40">
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Executive Workspace Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border/80 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <select
                      value={activeCollectionId}
                      onChange={(e) => setActiveCollectionId(e.target.value)}
                      className="text-base font-bold bg-transparent text-foreground focus:outline-none cursor-pointer pr-2 hover:text-primary transition-colors"
                    >
                      {collections.map((col) => (
                        <option key={col.id} value={col.id} className="bg-surface text-foreground text-sm">
                          {col.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setIsCreateColOpen(true)}
                      className="p-1 rounded-md hover:bg-muted text-primary transition-colors"
                      title="Add Collection"
                    >
                      <FolderPlus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeCollection.description || "Multi-document knowledge repository with DeepDoc layout segmentation."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-9 px-3 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-muted-foreground hover:text-foreground text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Sync Documents"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
                  <span className="hidden sm:inline">Sync</span>
                </button>

                <button
                  onClick={() => setIsCreateColOpen(true)}
                  className="h-9 px-3 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-foreground text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>New Collection</span>
                </button>

                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Documents</span>
                </button>
              </div>
            </div>

            {/* Main Content View */}
            {currentTab === "documents" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                {/* Left: Document Knowledge Base */}
                <div className="xl:col-span-7 space-y-3">
                  {/* Table Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface border border-border/80 rounded-xl shadow-2xs">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground/70" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter documents in collection..."
                        className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border/80 bg-surface-subtle/50 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground text-foreground"
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 shrink-0 text-xs">
                      <button
                        onClick={() => setFileFilter("all")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          fileFilter === "all"
                            ? "bg-slate-900 text-white"
                            : "bg-surface-subtle text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        All ({documents.length})
                      </button>
                      <button
                        onClick={() => setFileFilter("pdf")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          fileFilter === "pdf"
                            ? "bg-slate-900 text-white"
                            : "bg-surface-subtle text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        PDFs ({documents.filter((d) => d.filename.toLowerCase().endsWith(".pdf")).length})
                      </button>
                      <button
                        onClick={() => setFileFilter("sheets")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          fileFilter === "sheets"
                            ? "bg-slate-900 text-white"
                            : "bg-surface-subtle text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Tables & Data
                      </button>
                    </div>
                  </div>

                  {/* Document Table */}
                  <DocumentTable
                    documents={filteredDocs}
                    onReprocess={handleReprocess}
                    onDelete={handleDelete}
                    onViewSource={(doc) =>
                      setInspectedCitation({
                        citation_id: 1,
                        document_id: doc.id,
                        document_name: doc.filename,
                        page_number: doc.metadata.page_count ? 1 : undefined,
                        snippet: `Indexed document ${doc.filename}. DeepDoc visual layout analysis completed. Chunks: ${doc.metadata.chunk_count}`,
                        relevance_score: 1.0,
                      })
                    }
                  />
                </div>

                {/* Right: Evidence-Grounded Reasoning Chat */}
                <div className="xl:col-span-5 h-[680px]">
                  <ChatPanel
                    selectedCollectionName={activeCollection.name}
                    selectedCollectionId={activeCollection.id}
                    onCitationClick={(cit) => setInspectedCitation(cit)}
                  />
                </div>
              </div>
            )}

            {/* Standalone Full-Screen Chat View */}
            {currentTab === "chat" && (
              <div className="h-[760px] max-w-4xl mx-auto">
                <ChatPanel
                  selectedCollectionName={activeCollection.name}
                  selectedCollectionId={activeCollection.id}
                  onCitationClick={(cit) => setInspectedCitation(cit)}
                />
              </div>
            )}

            {/* Pipeline Observability View */}
            {currentTab === "observability" && (
              <div className="space-y-4">
                <div className="p-5 border border-border/80 rounded-xl bg-surface shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        DeepDoc Ingestion Pipeline Telemetry
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Live status from RAGFlow and Infinity Vector Engine
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Pipeline Live
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border border-border/80 rounded-xl bg-surface-subtle/50">
                      <span className="text-xs text-muted-foreground">Active Processing Tasks</span>
                      <div className="text-2xl font-bold text-foreground mt-1">
                        {documents.filter((d) => d.stage !== "completed" && d.stage !== "failed").length}
                      </div>
                      <span className="text-[11px] text-primary font-medium">Real-time SSE Active</span>
                    </div>

                    <div className="p-4 border border-border/80 rounded-xl bg-surface-subtle/50">
                      <span className="text-xs text-muted-foreground">Total Chunks Stored</span>
                      <div className="text-2xl font-bold text-foreground mt-1">
                        {documents.reduce((acc, d) => acc + (d.metadata.chunk_count || 0), 0)}
                      </div>
                      <span className="text-[11px] text-emerald-600 font-mono font-medium">100% Vectorized</span>
                    </div>

                    <div className="p-4 border border-border/80 rounded-xl bg-surface-subtle/50">
                      <span className="text-xs text-muted-foreground">Vector Database</span>
                      <div className="text-2xl font-bold text-foreground mt-1">Infinity DB</div>
                      <span className="text-[11px] text-muted-foreground font-mono">Dense + Sparse BM25</span>
                    </div>

                    <div className="p-4 border border-border/80 rounded-xl bg-surface-subtle/50">
                      <span className="text-xs text-muted-foreground">Parsing Architecture</span>
                      <div className="text-2xl font-bold text-foreground mt-1">DeepDoc CV</div>
                      <span className="text-[11px] text-emerald-600 font-mono font-medium">Table Aware</span>
                    </div>
                  </div>
                </div>
              </div>
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

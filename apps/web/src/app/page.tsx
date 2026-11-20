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
  Layers,
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
      setTimeout(() => setIsRefreshing(false), 400);
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
    <div className="flex flex-col h-screen overflow-hidden bg-white text-zinc-900">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          documentCount={documents.length}
        />

        <main className="flex-1 p-5 overflow-y-auto bg-zinc-50/50">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Collection Workspace Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-white border border-zinc-200 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 shrink-0">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={activeCollectionId}
                      onChange={(e) => setActiveCollectionId(e.target.value)}
                      className="text-sm font-semibold bg-transparent text-zinc-900 focus:outline-none cursor-pointer pr-1"
                    >
                      {collections.map((col) => (
                        <option key={col.id} value={col.id} className="bg-white text-zinc-900 text-xs">
                          {col.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setIsCreateColOpen(true)}
                      className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                      title="New Collection"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-normal">
                    {activeCollection.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-7 px-2.5 rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 text-xs font-normal transition-colors flex items-center gap-1 shadow-2xs"
                  title="Sync"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin text-zinc-900" : "text-zinc-400"}`} />
                  <span className="hidden sm:inline">Sync</span>
                </button>

                <button
                  onClick={() => setIsCreateColOpen(true)}
                  className="h-7 px-2.5 rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-normal transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="h-3 w-3 text-zinc-400" />
                  <span>New Collection</span>
                </button>

                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="h-7 px-3 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Upload className="h-3 w-3" />
                  <span>Upload Files</span>
                </button>
              </div>
            </div>

            {/* Main Content View */}
            {currentTab === "documents" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                {/* Left: Document Knowledge Base */}
                <div className="xl:col-span-7 space-y-2.5">
                  {/* Table Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 bg-white border border-zinc-200 rounded-lg shadow-2xs">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-xs">
                      <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-zinc-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter documents..."
                        className="w-full h-7 pl-7 pr-2.5 text-xs rounded border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 placeholder:text-zinc-400 text-zinc-900"
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        onClick={() => setFileFilter("all")}
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                          fileFilter === "all"
                            ? "bg-zinc-900 text-white font-medium"
                            : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        All ({documents.length})
                      </button>
                      <button
                        onClick={() => setFileFilter("pdf")}
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                          fileFilter === "pdf"
                            ? "bg-zinc-900 text-white font-medium"
                            : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        PDF ({documents.filter((d) => d.filename.toLowerCase().endsWith(".pdf")).length})
                      </button>
                      <button
                        onClick={() => setFileFilter("sheets")}
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                          fileFilter === "sheets"
                            ? "bg-zinc-900 text-white font-medium"
                            : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        Spreadsheets
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
                        snippet: `Document: ${doc.filename}. Layout segmented with ${doc.metadata.chunk_count} chunk(s).`,
                        relevance_score: 1.0,
                      })
                    }
                  />
                </div>

                {/* Right: Reasoning Chat */}
                <div className="xl:col-span-5 h-[650px]">
                  <ChatPanel
                    selectedCollectionName={activeCollection.name}
                    selectedCollectionId={activeCollection.id}
                    onCitationClick={(cit) => setInspectedCitation(cit)}
                  />
                </div>
              </div>
            )}

            {/* Standalone Chat View */}
            {currentTab === "chat" && (
              <div className="h-[730px] max-w-4xl mx-auto">
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
                <div className="p-4 border border-zinc-200 rounded-lg bg-white shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-xs text-zinc-900">
                        Ingestion Telemetry
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Operational pipeline metrics from RAGFlow and Infinity DB
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Online
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="p-3 border border-zinc-200/80 rounded-md bg-zinc-50/50">
                      <span className="text-[11px] text-zinc-400">Active Tasks</span>
                      <div className="text-xl font-semibold text-zinc-900 mt-0.5">
                        {documents.filter((d) => d.stage !== "completed" && d.stage !== "failed").length}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">SSE Stream</span>
                    </div>

                    <div className="p-3 border border-zinc-200/80 rounded-md bg-zinc-50/50">
                      <span className="text-[11px] text-zinc-400">Total Chunks</span>
                      <div className="text-xl font-semibold text-zinc-900 mt-0.5">
                        {documents.reduce((acc, d) => acc + (d.metadata.chunk_count || 0), 0)}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">Vectorized</span>
                    </div>

                    <div className="p-3 border border-zinc-200/80 rounded-md bg-zinc-50/50">
                      <span className="text-[11px] text-zinc-400">Vector Store</span>
                      <div className="text-xl font-semibold text-zinc-900 mt-0.5">Infinity DB</div>
                      <span className="text-[10px] text-zinc-500 font-mono">BM25 + Dense</span>
                    </div>

                    <div className="p-3 border border-zinc-200/80 rounded-md bg-zinc-50/50">
                      <span className="text-[11px] text-zinc-400">Document Parser</span>
                      <div className="text-xl font-semibold text-zinc-900 mt-0.5">DeepDoc</div>
                      <span className="text-[10px] text-zinc-500 font-mono">Visual Layout</span>
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

"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { DocumentItem } from "@/types";
import { Upload, Plus, RefreshCw } from "lucide-react";

export default function WorkspacePage() {
  const [currentTab, setCurrentTab] = useState<"documents" | "chat" | "observability">("documents");
  const [activeCollection, setActiveCollection] = useState("Corporate Policies & Architecture");

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
    {
      id: "doc-003",
      collection_id: "col-01",
      filename: "Scanned_Vendor_Contract_Scan.pdf",
      file_type: "application/pdf",
      file_size_bytes: 4890000,
      stage: "ocr",
      progress_percentage: 65,
      metadata: {
        filename: "Scanned_Vendor_Contract_Scan.pdf",
        file_type: "application/pdf",
        file_size_bytes: 4890000,
        page_count: 12,
        chunk_count: 0,
      },
      created_at: "2026-11-20T08:12:00Z",
      updated_at: "2026-11-20T08:12:45Z",
    },
  ]);

  const handleReprocess = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, stage: "parsing", progress_percentage: 45 } : doc
      )
    );
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

        <main className="flex-1 p-6 overflow-y-auto bg-surface-subtle/40">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Workspace Bar */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {activeCollection}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Multi-document knowledge repository with DeepDoc layout segmentation and vector search.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Sync Indices
                </Button>
                <Button size="sm">
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
                    subtitle="Track parsing stages, OCR extraction, and chunk distribution"
                  >
                    <DocumentTable
                      documents={documents}
                      onReprocess={handleReprocess}
                      onDelete={handleDelete}
                    />
                  </Card>
                </div>

                <div className="h-[600px]">
                  <ChatPanel selectedCollectionName={activeCollection} />
                </div>
              </div>
            )}

            {currentTab === "chat" && (
              <div className="h-[750px]">
                <ChatPanel selectedCollectionName={activeCollection} />
              </div>
            )}

            {currentTab === "observability" && (
              <Card
                title="DeepDoc Ingestion Pipeline Telemetry"
                subtitle="Live status from RAGFlow and Infinity Vector Engine"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-border rounded-lg bg-surface">
                    <span className="text-xs text-muted-foreground">Active Processing Tasks</span>
                    <div className="text-2xl font-bold text-foreground mt-1">1</div>
                    <span className="text-[11px] text-primary">OCR layout analysis in progress</span>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-surface">
                    <span className="text-xs text-muted-foreground">Total Chunks Stored</span>
                    <div className="text-2xl font-bold text-foreground mt-1">128</div>
                    <span className="text-[11px] text-status-success font-mono">100% Vectorized</span>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-surface">
                    <span className="text-xs text-muted-foreground">Retrieval Engine</span>
                    <div className="text-2xl font-bold text-foreground mt-1">Infinity DB</div>
                    <span className="text-[11px] text-muted-foreground font-mono">Dense + Sparse BM25</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

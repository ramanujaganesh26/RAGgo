import React, { useState } from "react";
import { ChatMessage, Citation } from "@/types";
import { Button } from "../common/Button";
import { CitationCard } from "./CitationCard";
import { Send, CornerDownLeft, ShieldCheck } from "lucide-react";

interface ChatPanelProps {
  selectedCollectionName: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ selectedCollectionName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "assistant",
      content: `Knowledge workspace ready. Ask questions grounded in ${selectedCollectionName}. Citations map directly to source passages.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    const assistantMsg: ChatMessage = {
      id: `msg-resp-${Date.now()}`,
      sender: "assistant",
      content:
        "The RAG architecture utilizes DeepDoc layout models for table extraction and Infinity for multi-vector hybrid search [1]. Ingestion stages stream in real time via Server-Sent Events [2].",
      timestamp: new Date().toLocaleTimeString(),
      citations: [
        {
          citation_id: 1,
          document_id: "doc-001",
          document_name: "ARCHITECTURE.md",
          page_number: 1,
          snippet: "The platform is designed around a three-tier decoupled architecture: Enterprise Client, Application Gateway, and Foundational Ingestion Tier.",
          relevance_score: 0.96,
        },
        {
          citation_id: 2,
          document_id: "doc-002",
          document_name: "DEVELOPMENT_ROADMAP.md",
          page_number: 2,
          snippet: "Status display covers all lifecycle stages: Validating -> Parsing -> OCR -> Chunking -> Indexing -> Completed.",
          relevance_score: 0.91,
        },
      ],
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-surface-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-semibold text-xs text-foreground">Grounded Multi-Document Query</span>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          Scope: {selectedCollectionName}
        </span>
      </div>

      {/* Message stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-surface-subtle text-foreground border border-border"
              }`}
            >
              <p>{msg.content}</p>

              {/* Citations section */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-border/80">
                  <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                    Source Evidence & Citations:
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.citations.map((c) => (
                      <CitationCard
                        key={c.citation_id}
                        citation={c}
                        onSelect={(cit) => setActiveCitation(cit)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Selected Citation Drawer Preview */}
      {activeCitation && (
        <div className="p-3 bg-muted/60 border-t border-border flex items-start justify-between text-xs">
          <div>
            <span className="font-semibold text-foreground">
              Source [{activeCitation.citation_id}] &middot; {activeCitation.document_name}
            </span>
            <p className="text-muted-foreground mt-0.5">&ldquo;{activeCitation.snippet}&rdquo;</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveCitation(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Input box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-surface">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question across indexed documents..."
            className="flex-1 h-9 px-3 text-xs bg-surface-subtle border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" size="sm" disabled={!input.trim() || isSubmitting}>
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

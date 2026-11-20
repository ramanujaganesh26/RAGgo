import React, { useState } from "react";
import { Citation } from "@/types";
import { CitationCard } from "./CitationCard";
import { MarkdownRenderer } from "./MarkdownRenderer";
import {
  Send,
  ShieldCheck,
  Square,
  Copy,
  Check,
  Sparkles,
  User,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { useStreamingChat } from "@/hooks/useStreamingChat";

interface ChatPanelProps {
  selectedCollectionName: string;
  selectedCollectionId?: string;
  onCitationClick?: (citation: Citation) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  selectedCollectionName,
  selectedCollectionId = "col-default",
  onCitationClick,
}) => {
  const { messages, isStreaming, sendMessage, stopGeneration } =
    useStreamingChat(selectedCollectionId);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCitationNumClick = (
    citationId: number,
    citations?: Citation[]
  ) => {
    if (!citations) return;
    const found = citations.find((c) => c.citation_id === citationId);
    if (found && onCitationClick) {
      onCitationClick(found);
    }
  };

  const quickQueries = [
    "Where did this person study / work?",
    "What are their core technical skills?",
    "Summarize drone & GCS experience",
  ];

  return (
    <div className="flex flex-col h-full bg-surface border border-border/80 rounded-xl shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border/70 bg-surface flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs text-foreground tracking-tight">
                RAGgo Grounded Reasoning
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-subtle border border-border text-muted-foreground">
                DeepDoc Grounded
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              Active Scope: {selectedCollectionName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Verified Citations
          </span>
        </div>
      </div>

      {/* Message stream */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-surface-subtle/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-2xs ${
                msg.sender === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-surface border border-border text-primary"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="h-3.5 w-3.5" />
              ) : (
                <span className="font-mono font-bold text-[10px]">RG</span>
              )}
            </div>

            {/* Content Card */}
            <div
              className={`max-w-[88%] rounded-xl p-3.5 sm:p-4 text-xs transition-all ${
                msg.sender === "user"
                  ? "bg-slate-900 text-white font-medium shadow-2xs"
                  : "bg-surface text-foreground border border-border/80 shadow-2xs"
              }`}
            >
              {msg.sender === "user" ? (
                <p className="leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              ) : (
                <div>
                  <MarkdownRenderer
                    content={msg.content}
                    onCitationClick={(num) =>
                      handleCitationNumClick(num, msg.citations)
                    }
                  />

                  {msg.streaming && (
                    <span className="inline-block w-1.5 h-3.5 bg-primary ml-1 animate-pulse align-middle" />
                  )}

                  {/* Actions & Citations Footer */}
                  {!msg.streaming && msg.content && (
                    <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        <span className="font-medium text-foreground">
                          {msg.citations?.length || 0} Grounded Evidence Passage(s)
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded hover:bg-muted"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">
                              Copied
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Compact Citation Cards */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/40 space-y-1.5">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Source References
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.citations.map((c) => (
                          <CitationCard
                            key={c.citation_id}
                            citation={c}
                            onSelect={(cit) => onCitationClick?.(cit)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div
                className={`text-[10px] mt-1.5 ${
                  msg.sender === "user"
                    ? "text-slate-400 text-right font-mono"
                    : "text-muted-foreground font-mono"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Quick Query Pills */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-surface border-t border-border/60 flex flex-wrap gap-1.5 items-center shrink-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
            Prompt:
          </span>
          {quickQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-surface-subtle border border-border/80 hover:border-primary/50 text-foreground transition-colors hover:bg-muted"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-3.5 bg-surface border-t border-border/80 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question across your indexed enterprise documents..."
              disabled={isStreaming}
              className="w-full h-10 pl-3.5 pr-20 text-xs rounded-lg border border-border bg-surface-subtle focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground transition-all"
            />
            {isStreaming && (
              <button
                type="button"
                onClick={stopGeneration}
                className="absolute right-2 top-2 h-6 px-2 text-[10px] font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded flex items-center gap-1 hover:bg-rose-100 transition-colors"
              >
                <Square className="h-2.5 w-2.5 fill-current" />
                Stop
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="h-10 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { Citation } from "@/types";
import { Button } from "../common/Button";
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
  Trash2,
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
    <div className="flex flex-col h-full bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border bg-surface flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-foreground tracking-tight">
              Evidence-Grounded Intelligence
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono">
              Active: {selectedCollectionName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-status-success bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="h-3 w-3" />
            Verified Citations
          </span>
        </div>
      </div>

      {/* Message stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-surface-subtle/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface border border-border text-primary"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="h-3.5 w-3.5" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
            </div>

            {/* Content Card */}
            <div
              className={`max-w-[85%] rounded-xl p-4 text-xs transition-all ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground font-medium shadow-xs"
                  : "bg-surface text-foreground border border-border/80 shadow-xs"
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
                    <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>Document Evidence:</span>
                        <span className="font-semibold text-foreground">
                          {msg.citations?.length || 0} passage(s) cited
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-status-success" />
                            <span className="text-status-success font-medium">
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

                  {/* Citation Cards Grid */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 grid grid-cols-1 gap-1.5">
                      {msg.citations.map((c) => (
                        <CitationCard
                          key={c.citation_id}
                          citation={c}
                          onSelect={(cit) => onCitationClick?.(cit)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div
                className={`text-[10px] mt-1.5 ${
                  msg.sender === "user"
                    ? "text-primary-foreground/75 text-right"
                    : "text-muted-foreground"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Query Chips */}
      {messages.length <= 2 && (
        <div className="px-5 py-2 bg-surface border-t border-border/60 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mr-1">
            Suggested:
          </span>
          {quickQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-surface-subtle border border-border hover:border-primary/50 text-foreground transition-colors hover:bg-muted"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input box */}
      <form
        onSubmit={handleSubmit}
        className="p-3.5 border-t border-border bg-surface"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question across indexed documents..."
            disabled={isStreaming}
            className="flex-1 h-9 px-3.5 text-xs bg-surface-subtle border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground disabled:opacity-60 transition-all"
          />
          {isStreaming ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={stopGeneration}
              title="Stop Generation"
            >
              <Square className="h-3 w-3 mr-1 fill-current text-status-error" />
              Stop
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim()}
              className="px-4"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              Send
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

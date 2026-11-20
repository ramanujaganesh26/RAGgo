import React, { useState } from "react";
import { Citation } from "@/types";
import { Button } from "../common/Button";
import { CitationCard } from "./CitationCard";
import { Send, ShieldCheck, Square } from "lucide-react";
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
  const { messages, isStreaming, sendMessage, stopGeneration } = useStreamingChat(selectedCollectionId);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
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
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {msg.streaming && (
                <span className="inline-block w-1.5 h-3.5 bg-primary ml-1 animate-pulse align-middle" />
              )}

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
                        onSelect={(cit) => onCitationClick?.(cit)}
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

      {/* Input box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-surface">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question across indexed documents..."
            disabled={isStreaming}
            className="flex-1 h-9 px-3 text-xs bg-surface-subtle border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground disabled:opacity-60"
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
            <Button type="submit" size="sm" disabled={!input.trim()}>
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Send
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

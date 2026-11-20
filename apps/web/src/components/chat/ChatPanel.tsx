import React, { useState } from "react";
import { Citation } from "@/types";
import { CitationCard } from "./CitationCard";
import { MarkdownRenderer } from "./MarkdownRenderer";
import {
  Send,
  Square,
  Copy,
  Check,
  User,
  MessageSquare,
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
    <div className="flex flex-col h-full bg-white border border-zinc-200 rounded-lg shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-zinc-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-zinc-500" />
          <div>
            <h3 className="font-medium text-xs text-zinc-900 tracking-tight">
              Query Assistant
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono">
              Scope: {selectedCollectionName}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-zinc-400">
          Hybrid BM25
        </span>
      </div>

      {/* Message stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-zinc-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-medium ${
                msg.sender === "user"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {msg.sender === "user" ? "U" : "RG"}
            </div>

            {/* Content Card */}
            <div
              className={`max-w-[88%] rounded-lg p-3 text-xs transition-colors ${
                msg.sender === "user"
                  ? "bg-zinc-900 text-white font-normal"
                  : "bg-white text-zinc-900 border border-zinc-200 shadow-2xs"
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
                    <span className="inline-block w-1.5 h-3 bg-zinc-400 ml-1 align-middle" />
                  )}

                  {/* Footer & Copy */}
                  {!msg.streaming && msg.content && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>
                        {msg.citations?.length || 0} referenced source(s)
                      </span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-700 px-1.5 py-0.5 rounded hover:bg-zinc-100 transition-colors"
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

                  {/* Compact Citation References */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-100 space-y-1">
                      <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                        Sources
                      </div>
                      <div className="space-y-1">
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
                className={`text-[10px] mt-1 ${
                  msg.sender === "user"
                    ? "text-zinc-400 text-right font-mono"
                    : "text-zinc-400 font-mono"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Quick Queries */}
      {messages.length <= 2 && (
        <div className="px-3.5 py-1.5 bg-white border-t border-zinc-100 flex flex-wrap gap-1.5 items-center shrink-0">
          {quickQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="text-[11px] px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-zinc-200 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question across indexed documents..."
              disabled={isStreaming}
              className="w-full h-8 pl-3 pr-16 text-xs rounded-md border border-zinc-200 bg-zinc-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 placeholder:text-zinc-400 text-zinc-900 transition-colors"
            />
            {isStreaming && (
              <button
                type="button"
                onClick={stopGeneration}
                className="absolute right-1.5 top-1.5 h-5 px-1.5 text-[10px] text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded flex items-center gap-1"
              >
                <Square className="h-2 w-2 fill-current" />
                Stop
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="h-8 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1"
          >
            <Send className="h-3 w-3" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

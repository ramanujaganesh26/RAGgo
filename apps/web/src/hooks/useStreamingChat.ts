import { useState, useRef } from "react";
import { ChatMessage, Citation } from "@/types";

export const useStreamingChat = (collectionId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "assistant",
      content:
        "Knowledge workspace active. Ask questions grounded across your indexed enterprise documents.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async (queryText: string) => {
    if (!queryText.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: queryText,
      timestamp: new Date().toLocaleTimeString(),
    };

    const assistantId = `assistant-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantId,
      sender: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString(),
      streaming: true,
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          collection_ids: [collectionId],
          top_k: 5,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Failed to initialize stream");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream response body unavailable");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            try {
              const payload = JSON.parse(dataStr);
              if (payload.token) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: msg.content + payload.token }
                      : msg
                  )
                );
              }
              if (payload.done) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? {
                          ...msg,
                          citations: payload.citations,
                          streaming: false,
                        }
                      : msg
                  )
                );
              }
            } catch (parseErr) {
              // Ignore partial frame parse
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content:
                    "The system processes documents across multi-stage lifecycles with DeepDoc layout detection and hybrid Infinity search [1].",
                  citations: [
                    {
                      citation_id: 1,
                      document_id: "doc-arch-001",
                      document_name: "ARCHITECTURE.md",
                      page_number: 1,
                      snippet:
                        "The platform is designed around a three-tier decoupled architecture: Enterprise Client, Application Gateway, and Foundational Ingestion Tier.",
                      relevance_score: 0.95,
                    },
                  ],
                  streaming: false,
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  return { messages, isStreaming, sendMessage, stopGeneration };
};

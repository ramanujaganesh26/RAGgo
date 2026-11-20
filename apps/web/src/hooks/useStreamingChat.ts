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
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const response = await fetch(`${apiBase}/chat/completions`, {
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
      let accumulatedText = "";

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
                accumulatedText += payload.token;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: accumulatedText }
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
                  content: `Unable to retrieve answer: ${err.message || "Communication error with Application Gateway."}`,
                  citations: [],
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

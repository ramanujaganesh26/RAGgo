import { useEffect } from "react";
import { DocumentItem, IngestionStage } from "@/types";

export const useDocumentStages = (
  documents: DocumentItem[],
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>
) => {
  useEffect(() => {
    const processingDocs = documents.filter(
      (doc) => doc.stage !== "completed" && doc.stage !== "failed" && doc.stage !== "cancelled"
    );

    if (processingDocs.length === 0) return;

    // Monitor the latest active document via Server-Sent Events
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
    const targetDoc = processingDocs[0];
    const eventSource = new EventSource(`${apiBase}/documents/${targetDoc.id}/stages`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === targetDoc.id
              ? {
                  ...doc,
                  stage: data.stage as IngestionStage,
                  progress_percentage: data.progress_percentage,
                  updated_at: data.timestamp,
                }
              : doc
          )
        );
        if (data.stage === "completed" || data.stage === "failed") {
          eventSource.close();
        }
      } catch (err) {
        // SSE frame parse error
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [documents.length]);
};

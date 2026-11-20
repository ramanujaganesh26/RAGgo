export type IngestionStage =
  | "pending"
  | "uploading"
  | "uploaded"
  | "validating"
  | "parsing"
  | "ocr"
  | "chunking"
  | "indexing"
  | "completed"
  | "failed"
  | "cancelled";

export type ParsingTemplate = "general" | "law" | "manual" | "table" | "paper";

export interface Collection {
  id: string;
  name: string;
  description?: string;
  parsing_template: ParsingTemplate;
  embedding_model: string;
  document_count: number;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentMetadata {
  filename: string;
  file_type: string;
  file_size_bytes: number;
  page_count?: number;
  chunk_count: number;
  parsing_duration_seconds?: number;
  error_message?: string;
}

export interface DocumentItem {
  id: string;
  collection_id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  stage: IngestionStage;
  progress_percentage: number;
  metadata: DocumentMetadata;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  citation_id: number;
  document_id: string;
  document_name: string;
  page_number?: number;
  snippet: string;
  relevance_score: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: string;
  streaming?: boolean;
}

import React from "react";
import { IngestionStage } from "@/types";
import { Badge } from "../common/Badge";

interface StageIndicatorProps {
  stage: IngestionStage;
  progress: number;
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({ stage, progress }) => {
  const getStageMeta = (stage: IngestionStage) => {
    switch (stage) {
      case "completed":
        return { label: "Indexed", variant: "success" as const };
      case "failed":
        return { label: "Failed", variant: "error" as const };
      case "parsing":
        return { label: "DeepDoc Parsing", variant: "info" as const };
      case "ocr":
        return { label: "OCR Recognition", variant: "info" as const };
      case "chunking":
        return { label: "Chunking", variant: "info" as const };
      case "indexing":
        return { label: "Vector Indexing", variant: "info" as const };
      case "validating":
        return { label: "Validating", variant: "warning" as const };
      case "uploading":
      case "uploaded":
        return { label: "Uploading", variant: "warning" as const };
      case "pending":
      default:
        return { label: "Pending", variant: "neutral" as const };
    }
  };

  const meta = getStageMeta(stage);

  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <div className="flex items-center justify-between text-xs">
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <span className="text-[11px] font-mono text-muted-foreground">{progress}%</span>
      </div>
      {stage !== "completed" && stage !== "failed" && (
        <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

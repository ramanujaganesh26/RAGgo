import React from "react";
import { IngestionStage } from "@/types";

interface StageIndicatorProps {
  stage: IngestionStage;
  progress: number;
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({ stage, progress }) => {
  if (stage === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-700 font-normal">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        <span>Ready</span>
      </span>
    );
  }

  if (stage === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 font-normal">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        <span>Failed</span>
      </span>
    );
  }

  const getStageLabel = (st: IngestionStage) => {
    switch (st) {
      case "parsing":
        return "Parsing";
      case "ocr":
        return "OCR";
      case "chunking":
        return "Chunking";
      case "indexing":
        return "Indexing";
      default:
        return "Processing";
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 font-normal">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span>{getStageLabel(stage)} ({progress}%)</span>
    </span>
  );
};

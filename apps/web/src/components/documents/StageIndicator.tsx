import React from "react";
import { IngestionStage } from "@/types";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface StageIndicatorProps {
  stage: IngestionStage;
  progress: number;
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({ stage, progress }) => {
  if (stage === "completed") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Indexed</span>
      </div>
    );
  }

  if (stage === "failed") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="h-3 w-3 text-rose-500" />
        <span>Failed</span>
      </div>
    );
  }

  const getStageLabel = (st: IngestionStage) => {
    switch (st) {
      case "parsing":
        return "DeepDoc Parsing";
      case "ocr":
        return "OCR Recognition";
      case "chunking":
        return "Chunking";
      case "indexing":
        return "Vector Indexing";
      case "validating":
        return "Validating";
      case "uploading":
      case "uploaded":
        return "Uploading";
      default:
        return "Processing";
    }
  };

  return (
    <div className="flex flex-col gap-1 min-w-[130px]">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium text-blue-700 flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
          {getStageLabel(stage)}
        </span>
        <span className="font-mono text-muted-foreground">{progress}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
        <div
          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

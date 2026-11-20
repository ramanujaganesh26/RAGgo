import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  onCitationClick?: (citationId: number) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onCitationClick,
}) => {
  // Replace citation markers like [1], [2] with a custom markdown element or handle them in text
  const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const num = parseInt(match[1], 10);
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onCitationClick?.(num);
            }}
            title={`View Source Citation [${num}]`}
            className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 mx-0.5 text-[10px] font-mono font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded transition-colors align-baseline shadow-xs"
          >
            {num}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="text-xs leading-relaxed text-foreground space-y-3 font-sans">
      <ReactMarkdown
        components={{
          h3: ({ children }) => (
            <div className="flex items-center gap-1.5 font-semibold text-[13px] text-foreground tracking-tight pt-2 pb-1 border-b border-border/60">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>{typeof children === "string" ? renderTextWithCitations(children) : children}</span>
            </div>
          ),
          h4: ({ children }) => (
            <h4 className="font-semibold text-xs text-foreground mt-2 mb-1">
              {typeof children === "string" ? renderTextWithCitations(children) : children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-1.5 leading-relaxed text-foreground/90">
              {React.Children.map(children, (child) =>
                typeof child === "string" ? renderTextWithCitations(child) : child
              )}
            </p>
          ),
          ul: ({ children }) => <ul className="space-y-1.5 my-2 pl-1">{children}</ul>,
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-xs leading-snug">
              <span className="text-primary/70 font-bold select-none text-[10px] mt-0.5">•</span>
              <div className="flex-1">
                {React.Children.map(children, (child) =>
                  typeof child === "string" ? renderTextWithCitations(child) : child
                )}
              </div>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-muted-foreground italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

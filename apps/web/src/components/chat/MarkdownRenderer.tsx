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
  const processNode = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === "string") {
      const parts = node.split(/(\[\d+\])/g);
      if (parts.length === 1) return node;

      return parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const num = parseInt(match[1], 10);
          return (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCitationClick?.(num);
              }}
              title={`View Evidence Citation [${num}]`}
              className="inline-flex items-center justify-center h-4 px-1.5 mx-0.5 text-[10px] font-mono font-medium text-primary bg-primary/10 hover:bg-primary hover:text-white rounded border border-primary/25 transition-all align-middle cursor-pointer shadow-2xs"
            >
              [{num}]
            </button>
          );
        }
        return part;
      });
    }

    if (React.isValidElement(node) && node.props?.children) {
      return React.cloneElement(
        node,
        {},
        React.Children.map(node.props.children, processNode)
      );
    }

    return node;
  };

  return (
    <div className="text-xs leading-relaxed text-foreground space-y-3 font-sans">
      <ReactMarkdown
        components={{
          h3: ({ children }) => (
            <div className="flex items-center gap-2 font-semibold text-[13px] text-foreground tracking-tight pt-2.5 pb-1 border-b border-border/70 my-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <div className="flex items-center gap-1.5">
                {React.Children.map(children, processNode)}
              </div>
            </div>
          ),
          h4: ({ children }) => (
            <h4 className="font-semibold text-xs text-foreground mt-2 mb-1 flex items-center gap-1">
              {React.Children.map(children, processNode)}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-1.5 leading-relaxed text-foreground/90">
              {React.Children.map(children, processNode)}
            </p>
          ),
          ul: ({ children }) => <ul className="space-y-1.5 my-2 pl-1">{children}</ul>,
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-xs leading-snug">
              <span className="text-primary font-bold select-none text-[10px] mt-0.5">•</span>
              <div className="flex-1">
                {React.Children.map(children, processNode)}
              </div>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {React.Children.map(children, processNode)}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-muted-foreground italic">
              {React.Children.map(children, processNode)}
            </em>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-mono text-primary font-medium border border-border">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

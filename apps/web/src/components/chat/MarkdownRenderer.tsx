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
              title={`View Source Citation [${num}]`}
              className="inline-flex items-center font-mono text-[10px] text-zinc-600 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-900 border border-zinc-200/80 rounded px-1 py-0.2 mx-0.5 align-baseline cursor-pointer transition-colors"
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
    <div className="text-xs leading-relaxed text-zinc-800 space-y-2 font-sans select-text">
      <ReactMarkdown
        components={{
          h3: ({ children }) => (
            <div className="font-semibold text-xs text-zinc-900 tracking-tight pt-2 pb-0.5 mt-2 mb-1">
              {React.Children.map(children, processNode)}
            </div>
          ),
          h4: ({ children }) => (
            <div className="font-medium text-xs text-zinc-900 mt-1.5 mb-0.5">
              {React.Children.map(children, processNode)}
            </div>
          ),
          p: ({ children }) => (
            <p className="my-1 text-zinc-700 leading-relaxed">
              {React.Children.map(children, processNode)}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-1 my-1.5 text-zinc-700">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="text-xs leading-relaxed">
              {React.Children.map(children, processNode)}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-medium text-zinc-900">
              {React.Children.map(children, processNode)}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-zinc-500 italic">
              {React.Children.map(children, processNode)}
            </em>
          ),
          code: ({ children }) => (
            <code className="px-1 py-0.2 rounded bg-zinc-100 text-[11px] font-mono text-zinc-800 border border-zinc-200">
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

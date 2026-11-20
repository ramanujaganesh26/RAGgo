import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAGgo | Enterprise Multi-Document Grounded RAG",
  description: "Enterprise Multi-Document RAG Engine with DeepDoc visual layout parsing and hybrid vector retrieval",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-surface text-foreground antialiased flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

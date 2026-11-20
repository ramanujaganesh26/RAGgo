import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AegisDoc Intelligence | Enterprise Multi-Document RAG",
  description: "Enterprise Multi-Document RAG Platform with deep document layout parsing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-surface text-foreground antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}

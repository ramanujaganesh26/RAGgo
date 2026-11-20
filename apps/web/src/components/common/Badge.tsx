import React from "react";

interface BadgeProps {
  variant?: "neutral" | "info" | "success" | "warning" | "error";
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  className = "",
}) => {
  const variantStyles = {
    neutral: "bg-muted text-muted-foreground border-border",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

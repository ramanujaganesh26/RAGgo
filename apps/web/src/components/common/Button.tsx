import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-md";

  const sizeStyles = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-11 px-6 text-base",
  };

  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
    secondary: "bg-surface-subtle text-foreground hover:bg-muted border border-border",
    outline: "border border-border bg-transparent hover:bg-surface-subtle text-foreground",
    danger: "bg-status-error text-white hover:opacity-90 shadow-sm",
    ghost: "bg-transparent hover:bg-surface-subtle text-foreground",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : null}
      {children}
    </button>
  );
};

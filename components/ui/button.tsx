import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        disabled:opacity-50 disabled:pointer-events-none
        ${variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90"}
        ${variant === "outline" && "border border-input hover:bg-accent hover:text-accent-foreground"}
        ${className}`}
      {...props}
    />
  );
}

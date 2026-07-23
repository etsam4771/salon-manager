import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 font-body font-medium rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<string, string> = {
  primary:
    "bg-forest text-sand-light hover:bg-forest-dark shadow-sm hover:shadow-md",
  secondary:
    "bg-transparent border border-forest text-forest hover:bg-forest hover:text-sand-light",
  ghost: "bg-transparent text-forest hover:bg-blush/40",
};

const sizes: Record<string, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-base px-6 py-3",
  lg: "text-lg px-8 py-4",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-fg)] shadow-[0_12px_34px_rgba(16,44,38,0.18)] dark:shadow-[0_12px_34px_rgba(247,231,206,0.26)] hover:shadow-[0_16px_44px_rgba(16,44,38,0.22)] dark:hover:shadow-[0_16px_44px_rgba(247,231,206,0.38)] hover:-translate-y-0.5",
  secondary:
    "bg-[color:var(--button-secondary-bg)] text-[color:var(--button-secondary-fg)] hover:bg-[color:var(--surface-strong)]",
  ghost: "bg-transparent text-[color:var(--button-ghost-fg)] hover:bg-[color:var(--surface-strong)]",
  danger: "bg-red-700 text-white hover:bg-red-800"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "group relative inline-flex min-h-10 items-center justify-center overflow-hidden rounded-full px-5 py-2 text-sm font-semibold tracking-[-0.01em] transition duration-300 disabled:pointer-events-none disabled:opacity-55",
        "focus-visible:ring-2 focus-visible:ring-brand-secondary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.99]",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0 before:opacity-0 before:transition before:duration-500 hover:before:opacity-100",
        styles[variant],
        className
      )}
    />
  );
}


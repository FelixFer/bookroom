"use client";

import Link from "next/link";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "icon"
  | "icon-danger";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-[#c4a878] dark:text-[#1e1a14] dark:hover:bg-[#e8d5b0]",
  secondary:
    "inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium border-zinc-200 text-zinc-900 hover:bg-zinc-100 dark:border-[#4a3a22] dark:text-[#e8d5b0] dark:hover:bg-[#2e2518]",
  ghost:
    "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-[#c4a878] dark:hover:bg-[#2e2518]",
  danger:
    "inline-flex h-10 items-center justify-center rounded-lg bg-rose-600 px-4 text-sm font-medium text-white disabled:opacity-60 hover:bg-rose-700",
  icon: "inline-flex items-center justify-center rounded border text-sm border-[#d4c4a0] text-[#6b5030] hover:bg-[#f5ede0] dark:border-[#4a3a22] dark:text-[#c4a878] dark:hover:bg-[#3a2e1c]",
  "icon-danger":
    "inline-flex items-center justify-center rounded border text-xs border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40",
};

const ICON_SIZE: Record<"sm" | "md", string> = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
};

type CommonProps = {
  variant?: ButtonVariant;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
  /** Only used with icon/icon-danger variants. sm=24px, md=28px. Defaults to md. */
  size?: "sm" | "md";
};

type AsLink = CommonProps & {
  href: string;
  onClick?: never;
  type?: never;
};

type AsButton = CommonProps & {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export type ButtonProps = AsLink | AsButton;

export const Button = ({
  variant = "primary",
  children,
  className,
  disabled,
  "aria-label": ariaLabel,
  size = "md",
  href,
  onClick,
  type = "button",
}: ButtonProps) => {
  const isIcon = variant === "icon" || variant === "icon-danger";
  const cls = [VARIANT_CLASSES[variant], isIcon ? ICON_SIZE[size] : undefined, className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  );
};

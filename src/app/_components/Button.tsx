'use client'

import Link from 'next/link'
import { LoaderDots } from '@/app/_components/Loader'

export type ButtonVariant =
  | 'primary'
  | 'soft'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'icon'
  | 'icon-danger'
  | 'link';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'inline-flex h-10 items-center justify-center rounded-lg bg-[#3d2e1a] px-4 text-sm font-medium text-[#fdf8f0] hover:bg-[#2a1f10] disabled:opacity-60 dark:bg-[#c4a878] dark:text-[#1e1a14] dark:hover:bg-[#e8d5b0] cursor-pointer',
  soft:
    'inline-flex h-10 items-center justify-center rounded-lg bg-[#e8d5b0] px-4 text-sm font-medium text-[#3d2e1a] hover:bg-[#d4c4a0] disabled:opacity-60 dark:bg-[#4a3a22] dark:text-[#e8d5b0] dark:hover:bg-[#5a4a2e] cursor-pointer',
  secondary:
    'inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium border-[#d4c4a0] text-[#3d2e1a] hover:bg-[#f5ede0] dark:border-[#4a3a22] dark:text-[#e8d5b0] dark:hover:bg-[#2e2518] cursor-pointer',
  ghost:
    'inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-[#6b5030] hover:bg-[#f5ede0] dark:text-[#c4a878] dark:hover:bg-[#2e2518] cursor-pointer',
  danger:
    'inline-flex h-10 items-center justify-center rounded-lg bg-rose-600 px-4 text-sm font-medium text-white disabled:opacity-60 hover:bg-rose-700 cursor-pointer',
  icon: 'inline-flex items-center justify-center rounded border text-sm border-[#d4c4a0] text-[#6b5030] hover:bg-[#f5ede0] dark:border-[#4a3a22] dark:text-[#c4a878] dark:hover:bg-[#3a2e1c] cursor-pointer',
  'icon-danger':
    'inline-flex items-center justify-center rounded border text-xs border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer',
  link:
    'inline-flex items-center text-sm font-medium underline-offset-4 hover:underline cursor-pointer'
}

const ICON_SIZE: Record<'sm' | 'md', string> = {
  sm: 'h-6 w-6',
  md: 'h-7 w-7',
}

type CommonProps = {
  variant?: ButtonVariant;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  'aria-label'?: string;
  /** Only used with icon/icon-danger variants. sm=24px, md=28px. Defaults to md. */
  size?: 'sm' | 'md';
};

type AsLink = CommonProps & {
  href: string;
  onClick?: never;
  type?: never;
};

type AsButton = CommonProps & {
  href?: never;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
};

export type ButtonProps = AsLink | AsButton;

export const Button = ({
  variant = 'primary',
  children,
  className,
  disabled,
  loading,
  'aria-label': ariaLabel,
  size = 'md',
  href,
  onClick,
  type = 'button',
}: ButtonProps) => {
  const isIcon = variant === 'icon' || variant === 'icon-danger'
  const cls = [VARIANT_CLASSES[variant], isIcon ? ICON_SIZE[size] : undefined, className]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading ? <LoaderDots /> : children}
    </button>
  )
}

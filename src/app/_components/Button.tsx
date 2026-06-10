'use client'

import Link from 'next/link'
import { LoaderDots } from '@/app/_components/Loader'

export type ButtonVariant = 'filled' | 'outline' | 'soft' | 'link' | 'icon';
export type ButtonColor = 'primary' | 'success' | 'danger' | 'warning' | 'grey';
export type ButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl';

type CommonProps = {
  variant?: ButtonVariant;
  color?: ButtonColor;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  'aria-label'?: string;
  size?: ButtonSize;
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
  variant = 'filled',
  color = 'primary',
  children,
  className,
  disabled,
  loading,
  'aria-label': ariaLabel,
  size = 'm',
  href,
  onClick,
  type = 'button',
}: ButtonProps) => {
  const isIcon = variant === 'icon'
  const cls = [
    'btn',
    `btn--${variant}`,
    `btn--${color}`,
    isIcon ? `btn--icon-${size}` : `btn--${size}`,
    className,
  ]
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

import React, { ReactNode } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}: ButtonProps) {
  const baseStyle =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-capsule-teal/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-capsule-teal hover:bg-[#164961] dark:bg-capsule-teal dark:hover:bg-[#164961] text-white shadow-md hover:shadow-lg',
    secondary:
      'bg-white dark:bg-[#162035]/80 border border-slate-200 dark:border-white/15 text-capsule-navy dark:text-white hover:bg-slate-50 dark:hover:bg-[#162035] shadow-xs',
    outline:
      'bg-transparent border-2 border-capsule-teal text-capsule-teal dark:text-teal-400 hover:bg-capsule-teal hover:text-white dark:hover:bg-capsule-teal dark:hover:text-white',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm dark:bg-rose-600 dark:hover:bg-rose-700',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
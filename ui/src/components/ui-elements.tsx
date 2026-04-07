import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div 
      className={cn("glass rounded-xl p-6 transition-all duration-300 hover:border-slate-400/30", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn("text-lg font-semibold text-white mb-4", className)}>{children}</h3>
);

export const Badge = ({ children, variant = 'info', className }: { children: React.ReactNode; variant?: 'info' | 'warning' | 'error' | 'success'; className?: string }) => {
  const variants = {
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs border font-medium", variants[variant], className)}>
      {children}
    </span>
  );
};

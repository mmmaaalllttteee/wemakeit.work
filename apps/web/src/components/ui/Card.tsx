import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  rainbow?: boolean;
}

export function Card({
  children,
  hoverable = true,
  rainbow = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`glass-card ${hoverable ? 'hover:shadow-glass-lg hover:-translate-y-0.5' : ''} ${rainbow ? 'glass-rainbow' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function CardTitle({ children, className = '', ...props }: CardTitleProps) {
  return (
    <h3 className={`text-xl font-bold ${className}`} {...props}>
      {children}
    </h3>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

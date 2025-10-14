import { ButtonHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, variant = 'primary', size = 'md', icon: Icon, loading, className = '', ...props },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'glass-button glass-rainbow hover:scale-105',
      secondary: 'glass-panel hover:shadow-glass-lg',
      ghost: 'hover:bg-white/10 dark:hover:bg-white/5',
      danger: 'glass-panel bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2.5 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          Icon && <Icon className="w-4 h-4 mr-2" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

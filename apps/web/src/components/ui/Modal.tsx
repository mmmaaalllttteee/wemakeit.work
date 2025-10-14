'use client';

import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {return null;}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto glass-rainbow">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-glass">{title}</h2>
          <button
            onClick={onClose}
            className="glass-panel p-2 hover:bg-white/20 dark:hover:bg-white/10 transition-colors rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">{footer}</div>
        )}
      </div>
    </div>
  );
}

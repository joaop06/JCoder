'use client';
import React from 'react';
import { CopyToClipboardButtonProps } from '@/types';
import { useToast } from '@/components/toast/ToastContext';

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
  textToCopy,
  className = '',
  label = 'Copy',
  successMessage = 'Copied',
  errorMessage = 'Failed to copy',
}) => {
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success(successMessage);
    } catch (err) {
      toast.error(errorMessage);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center px-3 py-1.5 border border-jcoder rounded-md text-sm font-medium text-jcoder-muted hover:bg-jcoder-secondary hover:text-jcoder-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jcoder-primary transition-colors ${className}`}
    >
      <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1.5M9 3h6l-2 2H9V3zM15 7h3a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h3" />
      </svg>
      {label}
    </button>
  );
};

export default CopyToClipboardButton;

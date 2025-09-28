import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'default', text = 'Carregando...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export function Toast({ 
  type = 'info', 
  message, 
  isVisible, 
  onClose, 
  duration = 5000,
  closable = true 
}) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  if (!show) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          className: 'border-green-200 bg-green-50 text-green-800',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: XCircle,
          className: 'border-red-200 bg-red-50 text-red-800',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          icon: Info,
          className: 'border-blue-200 bg-blue-50 text-blue-800',
          iconColor: 'text-blue-600'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-2">
      <Alert className={config.className}>
        <div className="flex items-start space-x-2">
          <Icon className={`w-4 h-4 mt-0.5 ${config.iconColor}`} />
          <div className="flex-1">
            <AlertDescription className="text-sm">
              {message}
            </AlertDescription>
          </div>
          {closable && (
            <button
              onClick={handleClose}
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </Alert>
    </div>
  );
}

// Hook para gerenciar toasts
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  };

  const error = (message, options = {}) => {
    return addToast({ type: 'error', message, ...options });
  };

  const warning = (message, options = {}) => {
    return addToast({ type: 'warning', message, ...options });
  };

  const info = (message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
}

export type ToastId = string;
export type ToastType = 'success' | 'error' | 'info' | 'confirm';

export interface ToastOptions {
    id?: ToastId;
    message: string;
    type?: ToastType;
    durationMs?: number;

    confirmText?: string;
    onConfirm?: () => void;

    cancelText?: string;
    onCancel?: () => void;
};

export interface ToastInternal extends ToastOptions {
    id: ToastId;
};

export interface ToastContextValue {
    dismissAll: () => void;
    dismiss: (id: ToastId) => void;
    info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => ToastId;
    error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => ToastId;
    success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => ToastId;
    confirm: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => Promise<boolean>;
};

export type ToastProviderProps = {
    maxVisible?: number; // visible toast limit
    position?: 'top-center'; // Makes it easier to evolve positions in the future
    children: React.ReactNode;
    defaultDurationMs?: number;
};

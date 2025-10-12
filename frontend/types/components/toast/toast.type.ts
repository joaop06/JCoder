export type ToastId = string;
export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
    id?: ToastId;
    message: string;
    type?: ToastType;
    durationMs?: number;
};

export interface ToastInternal extends Required<ToastOptions> {
    id: ToastId;
};

export interface ToastContextValue {
    dismissAll: () => void;
    dismiss: (id: ToastId) => void;
    info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => ToastId;
    error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => ToastId;
    success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => ToastId;
};

export type ToastProviderProps = {
    maxVisible?: number; // visible toast limit
    position?: 'top-center'; // Makes it easier to evolve positions in the future
    children: React.ReactNode;
    defaultDurationMs?: number;
};

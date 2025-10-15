'use client';

import {
    useRef,
    useMemo,
    useState,
    useEffect,
    useContext,
    useCallback,
    createContext,
} from 'react';
import React from 'react';
import {
    ToastId,
    ToastType,
    ToastOptions,
    ToastInternal,
    ToastContextValue,
    ToastProviderProps,
} from '@/types/components/toast/toast.type';

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
};

function genId() {
    return Math.random().toString(36).slice(2, 9);
};

export function ToastProvider({
    children,
    maxVisible = 3,
    position = 'top-center',
    defaultDurationMs = 2200,
}: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastInternal[]>([]);
    const timers = useRef<Map<ToastId, number>>(new Map());
    const resolvers = useRef<Map<ToastId, (value: boolean) => void>>(new Map());

    const addToast = useCallback(
        (t: ToastOptions & { type: ToastType }) => {
            const id = t.id ?? genId();
            const toast: ToastInternal = {
                id,
                type: t.type,
                message: t.message,
                onCancel: t.onCancel,
                onConfirm: t.onConfirm,
                cancelText: t.cancelText,
                confirmText: t.confirmText,
                durationMs: t.durationMs ?? defaultDurationMs,
            };

            setToasts((curr) => {
                const next = [toast, ...curr];
                // keeps up to maxVisible on screen (FIFO in excess)
                if (next.length > maxVisible) {
                    return next.slice(0, maxVisible);
                }
                return next;
            });

            if (t.type !== 'confirm') {
                const timer = window.setTimeout(() => {
                    setToasts((curr) => curr.filter((it) => it.id !== id));
                    timers.current.delete(id);
                }, toast.durationMs);
                timers.current.set(id, timer);
            }

            return id;
        },
        [defaultDurationMs, maxVisible]
    );

    const dismiss = useCallback((id: ToastId) => {
        setToasts((curr) => curr.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
        const resolve = resolvers.current.get(id);
        if (resolve) {
            resolve(false);
            resolvers.current.delete(id);
        }
    }, []);

    const dismissAll = useCallback(() => {
        setToasts([]);
        timers.current.forEach((timer) => clearTimeout(timer));
        timers.current.clear();
        resolvers.current.forEach((resolve) => resolve(false));
        resolvers.current.clear();
    }, []);

    const confirm = useCallback(
        (message: string, options?: Omit<ToastOptions, 'message' | 'type'>): Promise<boolean> => {
            return new Promise((resolve) => {
                const id = addToast({ type: 'confirm', message, ...options });
                resolvers.current.set(id, resolve);
            });
        },
        [addToast]
    );

    useEffect(() => {
        return () => {
            timers.current.forEach((timer) => clearTimeout(timer));
            timers.current.clear();
            resolvers.current.forEach((resolve) => resolve(false));
            resolvers.current.clear();
        };
    }, []);

    const api = useMemo<ToastContextValue>(
        () => ({
            success: (message, options) => addToast({ type: 'success', message, ...options }),
            error: (message, options) => addToast({ type: 'error', message, ...options }),
            info: (message, options) => addToast({ type: 'info', message, ...options }),
            confirm,
            dismiss,
            dismissAll,
        }),
        [addToast, confirm, dismiss, dismissAll]
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <ToastContainer toasts={toasts} position={position} onDismiss={dismiss} resolvers={resolvers.current} />
        </ToastContext.Provider>
    );
}

function ToastContainer({
    toasts,
    position,
    onDismiss,
    resolvers
}: {
    position: 'top-center';
    toasts: ToastInternal[];
    onDismiss: (id: ToastId) => void;
    resolvers: Map<ToastId, (value: boolean) => void>;
}) {
    return (
        <div
            className={`
        pointer-events-none fixed inset-0 z-[9999]
        flex ${position === 'top-center' ? 'items-start justify-center' : ''}
        p-4
      `}
            aria-live="polite"
            role="status"
        >
            <div className="mt-2 flex flex-col gap-2">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} resolvers={resolvers} />
                ))}
            </div>
        </div>
    );
}

function ToastItem({
    toast,
    onDismiss,
    resolvers
}: {
    toast: ToastInternal;
    onDismiss: (id: ToastId) => void;
    resolvers: Map<ToastId, (value: boolean) => void>;
}) {
    // Transição simples: mount com fade/translateY
    const [show, setShow] = useState(false);
    useEffect(() => {
        const f = requestAnimationFrame(() => setShow(true));
        return () => cancelAnimationFrame(f);
    }, []);

    const handleConfirm = () => {
        if (toast.onConfirm) toast.onConfirm();
        const resolve = resolvers.get(toast.id);
        if (resolve) resolve(true);
        onDismiss(toast.id);
    };

    const handleCancel = () => {
        if (toast.onCancel) toast.onCancel();
        const resolve = resolvers.get(toast.id);
        if (resolve) resolve(false);
        onDismiss(toast.id);
    };

    // Palette and style: blend between primary and accent for success; red for error; soft primary for info
    const background =
        toast.type === 'success'
            ? 'linear-gradient(135deg, color-mix(in oklab, var(--primary) 70%, var(--accent) 30%), color-mix(in oklab, var(--primary) 50%, var(--accent) 50%))'
            : toast.type === 'error'
                ? 'linear-gradient(135deg, color-mix(in oklab, var(--primary) 70%, #ef4444 30%), color-mix(in oklab, var(--primary) 50%, #ef4444 50%))'
                : toast.type === 'confirm'
                    ? 'linear-gradient(135deg, color-mix(in oklab, var(--primary) 80%, var(--secondary) 20%), color-mix(in oklab, var(--primary) 60%, var(--secondary) 40%))'
                    : 'linear-gradient(135deg, color-mix(in oklab, var(--primary) 85%, var(--foreground) 15%), color-mix(in oklab, var(--primary) 70%, var(--foreground) 30%))';

    const borderColor =
        toast.type === 'success'
            ? 'color-mix(in oklab, var(--accent) 55%, transparent 45%)'
            : toast.type === 'error'
                ? 'color-mix(in oklab, #ef4444 55%, transparent 45%)'
                : toast.type === 'confirm'
                    ? 'color-mix(in oklab, var(--secondary) 55%, transparent 45%)'
                    : 'color-mix(in oklab, var(--foreground) 30%, transparent 70%)';

    const iconBg =
        toast.type === 'success'
            ? 'color-mix(in oklab, var(--accent) 85%, var(--background) 15%)'
            : toast.type === 'error'
                ? 'color-mix(in oklab, #ef4444 85%, var(--background) 15%)'
                : toast.type === 'confirm'
                    ? 'color-mix(in oklab, var(--secondary) 85%, var(--background) 15%)'
                    : 'color-mix(in oklab, var(--foreground) 70%, var(--background) 30%)';

    const shadow =
        toast.type === 'success'
            ? '0 8px 30px -8px color-mix(in oklab, var(--accent) 35%, transparent)'
            : toast.type === 'error'
                ? '0 8px 30px -8px color-mix(in oklab, #ef4444 35%, transparent)'
                : toast.type === 'confirm'
                    ? '0 8px 30px -8px color-mix(in oklab, var(--secondary) 25%, transparent)'
                    : '0 8px 30px -8px color-mix(in oklab, var(--foreground) 25%, transparent)';

    return (
        <div
            className={`
        pointer-events-auto
        flex items-center gap-2
        rounded-full px-4 py-2 text-sm
        shadow-lg backdrop-blur-md
        transition-all duration-300
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
            style={{
                background,
                color: toast.type === 'confirm' ? 'var(--accent-foreground)' : 'var(--primary-foreground)',
                border: '1px solid',
                borderColor,
                boxShadow: shadow,
            }}
            role="alert"
        >
            <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full"
                style={{ background: iconBg, color: 'var(--primary)' }}
            >
                {toast.type === 'success' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : toast.type === 'error' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8v5m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : toast.type === 'confirm' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 9v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 17h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                )}
            </span>

            <span className="font-medium">
                {toast.message}
            </span>

            {toast.type === 'confirm' ? (
                <div className="flex gap-2 ml-2">
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-3 py-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors text-xs font-semibold"
                    >
                        {toast.confirmText || 'Confirm'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-3 py-1 rounded-full bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors text-xs font-semibold"
                    >
                        {toast.cancelText || 'Cancel'}
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full hover:opacity-85 transition-opacity"
                    style={{ color: 'var(--primary-foreground)' }}
                    aria-label="Fechar notificação"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </div>
    );
};

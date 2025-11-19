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
import {
    ToastId,
    ToastType,
    ToastOptions,
    ToastInternal,
    ToastContextValue,
    ToastProviderProps,
} from '@/types';
import React from 'react';

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

    // Minimalist design with clear visual differentiation
    const getToastStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return {
                    background: 'var(--card)',
                    borderColor: 'rgba(0, 255, 136, 0.3)',
                    iconColor: '#00ff88',
                    textColor: 'var(--foreground)',
                    shadow: '0 4px 20px -4px rgba(0, 255, 136, 0.15)',
                };
            case 'error':
                return {
                    background: 'var(--card)',
                    borderColor: 'rgba(255, 68, 68, 0.3)',
                    iconColor: '#ff4444',
                    textColor: 'var(--foreground)',
                    shadow: '0 4px 20px -4px rgba(255, 68, 68, 0.15)',
                };
            case 'info':
                return {
                    background: 'var(--card)',
                    borderColor: 'rgba(0, 100, 150, 0.3)',
                    iconColor: 'rgba(0, 100, 150, 0.8)',
                    textColor: 'var(--foreground)',
                    shadow: '0 4px 20px -4px rgba(0, 100, 150, 0.15)',
                };
            case 'confirm':
                return {
                    background: 'var(--card)',
                    borderColor: 'rgba(255, 170, 0, 0.3)',
                    iconColor: '#ffaa00',
                    textColor: 'var(--foreground)',
                    shadow: '0 4px 20px -4px rgba(255, 170, 0, 0.15)',
                };
            default:
                return {
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                    iconColor: 'var(--muted-foreground)',
                    textColor: 'var(--foreground)',
                    shadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                };
        }
    };

    const styles = getToastStyles(toast.type!);

    return (
        <div
            className={`
        pointer-events-auto
        flex items-center gap-3
        rounded-lg px-4 py-3 text-sm
        backdrop-blur-sm
        transition-all duration-300
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
            style={{
                background: styles.background,
                color: styles.textColor,
                border: '1px solid',
                borderColor: styles.borderColor,
                boxShadow: styles.shadow,
            }}
            role="alert"
        >
            <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full"
                style={{ color: styles.iconColor }}
            >
                {toast.type === 'success' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : toast.type === 'error' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : toast.type === 'confirm' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                        className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors text-xs font-medium"
                    >
                        {toast.confirmText || 'Confirm'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-3 py-1 rounded-md bg-jcoder-secondary text-jcoder-muted hover:bg-jcoder-border transition-colors text-xs font-medium border border-jcoder-border"
                    >
                        {toast.cancelText || 'Cancel'}
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-jcoder-secondary transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                    aria-label="Fechar notificação"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </div>
    );
};

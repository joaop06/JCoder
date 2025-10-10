export function safeInstantiate<T>(Cls: new (...args: any[]) => T): T | null {
    try {
        // try without arguments
        return new (Cls as any)();
    } catch {
        return null;
    }
};

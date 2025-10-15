import { safeInstantiate } from "./safe-instantiate";

export function extractExceptionInfo(Cls: new (...args: any[]) => any) {
    const inst = safeInstantiate(Cls);
    const statusCode =
        inst?.getStatus?.() ??
        // If it is HttpException, there may be a status in .status
        (inst as any)?.status ??
        undefined;
    // HttpException.message is the basic message
    const message = inst?.message;
    // getResponse() can return string | object
    const resp = inst?.getResponse?.();
    const error =
        typeof resp === 'object' && resp && 'message' in resp ? (resp as any).message : (resp as any).error;

    return { statusCode, message, error };
};

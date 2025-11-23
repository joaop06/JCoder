"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractExceptionInfo = extractExceptionInfo;
const safe_instantiate_1 = require("./safe-instantiate");
function extractExceptionInfo(Cls) {
    const inst = (0, safe_instantiate_1.safeInstantiate)(Cls);
    const statusCode = inst?.getStatus?.() ??
        inst?.status ??
        undefined;
    const message = inst?.message;
    const resp = inst?.getResponse?.();
    const error = typeof resp === 'object' && resp && 'message' in resp ? resp.message : resp.error;
    return { statusCode, message, error };
}
;
//# sourceMappingURL=extract-exception-info.js.map
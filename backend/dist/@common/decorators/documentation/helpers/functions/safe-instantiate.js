"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeInstantiate = safeInstantiate;
function safeInstantiate(Cls) {
    try {
        return new Cls();
    }
    catch {
        return null;
    }
}
;
//# sourceMappingURL=safe-instantiate.js.map
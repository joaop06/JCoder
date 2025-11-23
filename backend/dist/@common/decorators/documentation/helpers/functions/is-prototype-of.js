"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrototypeOf = isPrototypeOf;
function isPrototypeOf(base, derived) {
    let proto = derived.prototype;
    const baseProto = base.prototype;
    while (proto) {
        if (proto === baseProto)
            return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}
;
//# sourceMappingURL=is-prototype-of.js.map
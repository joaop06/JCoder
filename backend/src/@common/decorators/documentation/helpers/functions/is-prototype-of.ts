import { Type } from "@nestjs/common";

/**
 * Checks via prototype chain whether derived extends base (without instantiating).
 */
export function isPrototypeOf(base: Type<any>, derived: Type<any>): boolean {
    let proto = derived.prototype;
    const baseProto = base.prototype;

    while (proto) {
        if (proto === baseProto) return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
};

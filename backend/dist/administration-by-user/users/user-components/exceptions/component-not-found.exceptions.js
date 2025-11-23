"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class ComponentNotFoundException extends common_1.BadRequestException {
    constructor(componentType) {
        super(`${componentType} component not found`);
    }
}
exports.ComponentNotFoundException = ComponentNotFoundException;
;
//# sourceMappingURL=component-not-found.exceptions.js.map
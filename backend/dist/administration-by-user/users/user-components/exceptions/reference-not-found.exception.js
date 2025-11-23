"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class ReferenceNotFoundException extends common_1.NotFoundException {
    constructor() {
        super('Reference not found');
    }
}
exports.ReferenceNotFoundException = ReferenceNotFoundException;
//# sourceMappingURL=reference-not-found.exception.js.map
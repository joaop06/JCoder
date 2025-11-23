"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedAccessException = void 0;
const common_1 = require("@nestjs/common");
class UnauthorizedAccessException extends common_1.ForbiddenException {
    constructor() {
        super('You do not have permission to access this resource');
    }
}
exports.UnauthorizedAccessException = UnauthorizedAccessException;
;
//# sourceMappingURL=unauthorized-access.exception.js.map
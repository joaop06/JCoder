"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCurrentPasswordException = void 0;
const common_1 = require("@nestjs/common");
class InvalidCurrentPasswordException extends common_1.BadRequestException {
    constructor() {
        super('Current password is invalid');
    }
}
exports.InvalidCurrentPasswordException = InvalidCurrentPasswordException;
;
//# sourceMappingURL=invalid-current-password.exception.js.map
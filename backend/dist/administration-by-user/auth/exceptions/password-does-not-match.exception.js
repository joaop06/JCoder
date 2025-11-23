"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordDoesNotMatchException = void 0;
const common_1 = require("@nestjs/common");
class PasswordDoesNotMatchException extends common_1.BadRequestException {
    constructor() {
        super('Password does not match');
    }
}
exports.PasswordDoesNotMatchException = PasswordDoesNotMatchException;
;
//# sourceMappingURL=password-does-not-match.exception.js.map
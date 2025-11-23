"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsernameAlreadyExistsException = void 0;
const common_1 = require("@nestjs/common");
class UsernameAlreadyExistsException extends common_1.ConflictException {
    constructor() {
        super('Username already exists');
    }
}
exports.UsernameAlreadyExistsException = UsernameAlreadyExistsException;
;
//# sourceMappingURL=username-already-exists.exception.js.map
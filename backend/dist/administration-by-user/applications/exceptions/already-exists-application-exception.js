"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlreadyExistsApplicationException = void 0;
const common_1 = require("@nestjs/common");
class AlreadyExistsApplicationException extends common_1.ConflictException {
    constructor() {
        super('An application with this name already exists');
    }
}
exports.AlreadyExistsApplicationException = AlreadyExistsApplicationException;
;
//# sourceMappingURL=already-exists-application-exception.js.map
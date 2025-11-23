"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlreadyDeletedApplicationException = void 0;
const common_1 = require("@nestjs/common");
class AlreadyDeletedApplicationException extends common_1.BadRequestException {
    constructor() {
        super('Application is already deleted');
    }
}
exports.AlreadyDeletedApplicationException = AlreadyDeletedApplicationException;
;
//# sourceMappingURL=already-deleted-application.exception.js.map
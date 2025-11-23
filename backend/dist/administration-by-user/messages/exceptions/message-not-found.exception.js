"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class MessageNotFoundException extends common_1.HttpException {
    constructor() {
        super('Message not found', common_1.HttpStatus.NOT_FOUND);
    }
}
exports.MessageNotFoundException = MessageNotFoundException;
;
//# sourceMappingURL=message-not-found.exception.js.map
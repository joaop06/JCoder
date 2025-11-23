"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class ConversationNotFoundException extends common_1.NotFoundException {
    constructor() {
        super('Conversation not found');
    }
}
exports.ConversationNotFoundException = ConversationNotFoundException;
//# sourceMappingURL=conversation-not-found.exception.js.map
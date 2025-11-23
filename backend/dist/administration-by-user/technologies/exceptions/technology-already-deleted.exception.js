"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnologyAlreadyDeletedException = void 0;
const common_1 = require("@nestjs/common");
class TechnologyAlreadyDeletedException extends common_1.BadRequestException {
    constructor() {
        super('Technology is already deleted');
    }
}
exports.TechnologyAlreadyDeletedException = TechnologyAlreadyDeletedException;
//# sourceMappingURL=technology-already-deleted.exception.js.map
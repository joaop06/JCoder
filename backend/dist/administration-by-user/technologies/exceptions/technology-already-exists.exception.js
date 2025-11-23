"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnologyAlreadyExistsException = void 0;
const common_1 = require("@nestjs/common");
class TechnologyAlreadyExistsException extends common_1.ConflictException {
    constructor(name) {
        super(name
            ? `Technology with name '${name}' already exists`
            : 'Technology already exists');
    }
}
exports.TechnologyAlreadyExistsException = TechnologyAlreadyExistsException;
//# sourceMappingURL=technology-already-exists.exception.js.map
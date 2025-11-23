"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnologyNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class TechnologyNotFoundException extends common_1.NotFoundException {
    constructor() {
        super('Technology is not found');
    }
}
exports.TechnologyNotFoundException = TechnologyNotFoundException;
//# sourceMappingURL=technology-not-found.exception.js.map
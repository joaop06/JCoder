"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class EducationNotFoundException extends common_1.NotFoundException {
    constructor() {
        super('Education is not found');
    }
}
exports.EducationNotFoundException = EducationNotFoundException;
;
//# sourceMappingURL=education-not-found.exception.js.map
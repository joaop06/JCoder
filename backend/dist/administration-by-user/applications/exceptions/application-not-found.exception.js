"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class ApplicationNotFoundException extends common_1.NotFoundException {
    constructor() {
        super('Application is not found');
    }
}
exports.ApplicationNotFoundException = ApplicationNotFoundException;
;
//# sourceMappingURL=application-not-found.exception.js.map
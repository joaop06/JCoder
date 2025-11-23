"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiredFrontendComponentToApiApplication = void 0;
const common_1 = require("@nestjs/common");
class RequiredFrontendComponentToApiApplication extends common_1.BadRequestException {
    constructor() {
        super('Frontend component is required for Frontend applications');
    }
}
exports.RequiredFrontendComponentToApiApplication = RequiredFrontendComponentToApiApplication;
;
//# sourceMappingURL=required-frontend-component.exception.js.map
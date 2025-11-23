"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiredApiAndFrontendComponentsToFullstackApplication = void 0;
const common_1 = require("@nestjs/common");
class RequiredApiAndFrontendComponentsToFullstackApplication extends common_1.BadRequestException {
    constructor() {
        super('API and Frontend components are required for FULLSTACK applications');
    }
}
exports.RequiredApiAndFrontendComponentsToFullstackApplication = RequiredApiAndFrontendComponentsToFullstackApplication;
;
//# sourceMappingURL=required-api-and-frontend-components.exception.js.map
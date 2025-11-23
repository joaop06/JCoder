"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiredApiComponentToApiApplication = void 0;
const common_1 = require("@nestjs/common");
class RequiredApiComponentToApiApplication extends common_1.BadRequestException {
    constructor() {
        super('API component is required for API applications');
    }
}
exports.RequiredApiComponentToApiApplication = RequiredApiComponentToApiApplication;
;
//# sourceMappingURL=required-api-component.exception.js.map
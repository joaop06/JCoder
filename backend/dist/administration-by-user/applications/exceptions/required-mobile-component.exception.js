"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiredMobileComponentToMobileApplication = void 0;
const common_1 = require("@nestjs/common");
class RequiredMobileComponentToMobileApplication extends common_1.BadRequestException {
    constructor() {
        super('Mobile component is required for MOBILE applications');
    }
}
exports.RequiredMobileComponentToMobileApplication = RequiredMobileComponentToMobileApplication;
;
//# sourceMappingURL=required-mobile-component.exception.js.map
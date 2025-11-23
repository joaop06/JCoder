"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiredLibraryComponentToLibraryApplication = void 0;
const common_1 = require("@nestjs/common");
class RequiredLibraryComponentToLibraryApplication extends common_1.BadRequestException {
    constructor() {
        super('Library component is required for LIBRARY applications');
    }
}
exports.RequiredLibraryComponentToLibraryApplication = RequiredLibraryComponentToLibraryApplication;
;
//# sourceMappingURL=required-library-component.exception.js.map
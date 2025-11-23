"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class CertificateNotFoundException extends common_1.NotFoundException {
    constructor() {
        super('Certificate is not found');
    }
}
exports.CertificateNotFoundException = CertificateNotFoundException;
;
//# sourceMappingURL=certificate-not-found.exception.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidEducationDatesException = void 0;
const common_1 = require("@nestjs/common");
class InvalidEducationDatesException extends common_1.BadRequestException {
    constructor(message) {
        super(`Invalid education dates: ${message}`);
    }
}
exports.InvalidEducationDatesException = InvalidEducationDatesException;
;
//# sourceMappingURL=invalid-education-dates.exception.js.map
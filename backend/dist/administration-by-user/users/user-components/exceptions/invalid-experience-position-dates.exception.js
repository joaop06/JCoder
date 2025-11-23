"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidExperiencePositionDatesException = void 0;
const common_1 = require("@nestjs/common");
class InvalidExperiencePositionDatesException extends common_1.BadRequestException {
    constructor(message) {
        super(`Invalid experience position dates: ${message}`);
    }
}
exports.InvalidExperiencePositionDatesException = InvalidExperiencePositionDatesException;
;
//# sourceMappingURL=invalid-experience-position-dates.exception.js.map
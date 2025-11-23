"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfileWithAboutMeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../administration-by-user/users/entities/user.entity");
const propertiesToOmit = [
    'messages',
    'password',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'applications',
    'technologies',
    'userComponentEducation',
    'userComponentExperience',
    'userComponentCertificate',
    'applicationsComponentsApis',
    'applicationsComponentsMobiles',
    'applicationsComponentsFrontends',
    'applicationsComponentsLibraries',
];
class GetProfileWithAboutMeDto extends (0, swagger_1.OmitType)(user_entity_1.User, propertiesToOmit) {
}
exports.GetProfileWithAboutMeDto = GetProfileWithAboutMeDto;
;
//# sourceMappingURL=get-profile-with-about-me.dto.js.map
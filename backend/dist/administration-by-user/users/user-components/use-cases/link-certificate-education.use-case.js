"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkCertificateToEducationUseCase = void 0;
const common_1 = require("@nestjs/common");
const repositories_1 = require("../repositories");
const component_not_found_exceptions_1 = require("../exceptions/component-not-found.exceptions");
let LinkCertificateToEducationUseCase = class LinkCertificateToEducationUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(username, certificateUserId, educationUserId) {
        const certificate = await this.userComponentsRepository.certificateRepository.findOneBy({ id: certificateUserId, user: { username } });
        if (!certificate) {
            throw new component_not_found_exceptions_1.ComponentNotFoundException('Certificate');
        }
        const education = await this.userComponentsRepository.educationRepository.findOneBy({ id: educationUserId, user: { username } });
        if (!education) {
            throw new component_not_found_exceptions_1.ComponentNotFoundException('Education');
        }
        const currentEducationIds = certificate.educations?.map(e => e.id) || [];
        if (!currentEducationIds.includes(educationUserId)) {
            await this.userComponentsRepository.certificateRepository.setEducations(certificate.certificateName, [...currentEducationIds, educationUserId]);
        }
    }
};
exports.LinkCertificateToEducationUseCase = LinkCertificateToEducationUseCase;
exports.LinkCertificateToEducationUseCase = LinkCertificateToEducationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], LinkCertificateToEducationUseCase);
;
//# sourceMappingURL=link-certificate-education.use-case.js.map
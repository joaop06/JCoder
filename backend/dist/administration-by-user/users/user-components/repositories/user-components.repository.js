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
exports.UserComponentsRepository = void 0;
const common_1 = require("@nestjs/common");
const about_me_repository_1 = require("./about-me.repository");
const education_repository_1 = require("./education.repository");
const reference_repository_1 = require("./reference.repository");
const experience_repository_1 = require("./experience.repository");
const certificate_repository_1 = require("./certificate.repository");
let UserComponentsRepository = class UserComponentsRepository {
    constructor(aboutMeRepository, educationRepository, referenceRepository, experienceRepository, certificateRepository) {
        this.aboutMeRepository = aboutMeRepository;
        this.educationRepository = educationRepository;
        this.referenceRepository = referenceRepository;
        this.experienceRepository = experienceRepository;
        this.certificateRepository = certificateRepository;
    }
};
exports.UserComponentsRepository = UserComponentsRepository;
exports.UserComponentsRepository = UserComponentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [about_me_repository_1.AboutMeRepository,
        education_repository_1.EducationRepository,
        reference_repository_1.ReferenceRepository,
        experience_repository_1.ExperienceRepository,
        certificate_repository_1.CertificateRepository])
], UserComponentsRepository);
;
//# sourceMappingURL=user-components.repository.js.map
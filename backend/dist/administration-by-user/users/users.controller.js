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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const education_use_case_1 = require("./user-components/use-cases/education.use-case");
const experience_use_case_1 = require("./user-components/use-cases/experience.use-case");
const certificate_use_case_1 = require("./user-components/use-cases/certificate.use-case");
const reference_use_case_1 = require("./user-components/use-cases/reference.use-case");
const user_entity_1 = require("./entities/user.entity");
const owner_guard_1 = require("../../@common/guards/owner.guard");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const jwt_auth_guard_1 = require("../../@common/guards/jwt-auth.guard");
const get_profile_use_case_1 = require("./use-cases/get-profile.use-case");
const update_profile_use_case_1 = require("./use-cases/update-profile.use-case");
const user_not_found_exception_1 = require("./exceptions/user-not-found.exception");
const pagination_dto_1 = require("../../@common/dto/pagination.dto");
const unauthorized_access_exception_1 = require("./exceptions/unauthorized-access.exception");
const email_already_exists_exception_1 = require("./exceptions/email-already-exists.exception");
const swagger_1 = require("@nestjs/swagger");
const username_already_exists_exception_1 = require("./exceptions/username-already-exists.exception");
const invalid_current_password_exception_1 = require("./exceptions/invalid-current-password.exception");
const about_me_use_case_1 = require("./user-components/use-cases/about-me.use-case");
const component_not_found_exceptions_1 = require("./user-components/exceptions/component-not-found.exceptions");
const update_user_component_about_me_dto_1 = require("./user-components/dto/update-user-component-about-me.dto");
const create_user_component_education_dto_1 = require("./user-components/dto/create-user-component-education.dto");
const update_user_component_education_dto_1 = require("./user-components/dto/update-user-component-education.dto");
const create_user_component_experience_dto_1 = require("./user-components/dto/create-user-component-experience.dto");
const update_user_component_experience_dto_1 = require("./user-components/dto/update-user-component-experience.dto");
const api_exception_response_decorator_1 = require("../../@common/decorators/documentation/api-exception-response.decorator");
const create_user_component_certificate_dto_1 = require("./user-components/dto/create-user-component-certificate.dto");
const invalid_education_dates_exception_1 = require("./user-components/exceptions/invalid-education-dates.exception");
const update_user_component_certificate_dto_1 = require("./user-components/dto/update-user-component-certificate.dto");
const create_user_component_reference_dto_1 = require("./user-components/dto/create-user-component-reference.dto");
const update_user_component_reference_dto_1 = require("./user-components/dto/update-user-component-reference.dto");
const link_certificate_education_use_case_1 = require("./user-components/use-cases/link-certificate-education.use-case");
const unlink_certificate_education_use_case_1 = require("./user-components/use-cases/unlink-certificate-education.use-case");
const invalid_experience_position_dates_exception_1 = require("./user-components/exceptions/invalid-experience-position-dates.exception");
let UsersController = class UsersController {
    constructor(getAboutMeUseCase, getProfileUseCase, getEducationsUseCase, updateAboutMeUseCase, updateProfileUseCase, getExperiencesUseCase, createEducationUseCase, deleteEducationUseCase, getCertificatesUseCase, updateEducationUseCase, createExperienceUseCase, deleteExperienceUseCase, updateExperienceUseCase, createCertificateUseCase, deleteCertificateUseCase, updateCertificateUseCase, linkCertificateToEducationUseCase, unlinkCertificateFromEducationUseCase, getReferencesUseCase, createReferenceUseCase, deleteReferenceUseCase, updateReferenceUseCase) {
        this.getAboutMeUseCase = getAboutMeUseCase;
        this.getProfileUseCase = getProfileUseCase;
        this.getEducationsUseCase = getEducationsUseCase;
        this.updateAboutMeUseCase = updateAboutMeUseCase;
        this.updateProfileUseCase = updateProfileUseCase;
        this.getExperiencesUseCase = getExperiencesUseCase;
        this.createEducationUseCase = createEducationUseCase;
        this.deleteEducationUseCase = deleteEducationUseCase;
        this.getCertificatesUseCase = getCertificatesUseCase;
        this.updateEducationUseCase = updateEducationUseCase;
        this.createExperienceUseCase = createExperienceUseCase;
        this.deleteExperienceUseCase = deleteExperienceUseCase;
        this.updateExperienceUseCase = updateExperienceUseCase;
        this.createCertificateUseCase = createCertificateUseCase;
        this.deleteCertificateUseCase = deleteCertificateUseCase;
        this.updateCertificateUseCase = updateCertificateUseCase;
        this.linkCertificateToEducationUseCase = linkCertificateToEducationUseCase;
        this.unlinkCertificateFromEducationUseCase = unlinkCertificateFromEducationUseCase;
        this.getReferencesUseCase = getReferencesUseCase;
        this.createReferenceUseCase = createReferenceUseCase;
        this.deleteReferenceUseCase = deleteReferenceUseCase;
        this.updateReferenceUseCase = updateReferenceUseCase;
    }
    async getProfile(username) {
        return await this.getProfileUseCase.execute(username);
    }
    async updateProfile(username, updateProfileDto) {
        return await this.updateProfileUseCase.execute(username, updateProfileDto);
    }
    async getAboutMe(username) {
        return await this.getAboutMeUseCase.execute(username);
    }
    async updateAboutMe(username, dto) {
        return await this.updateAboutMeUseCase.execute(username, dto);
    }
    async getEducations(username, paginationDto) {
        return await this.getEducationsUseCase.execute(username, paginationDto);
    }
    async createEducation(username, dto) {
        return await this.createEducationUseCase.execute(username, dto);
    }
    async updateEducation(username, id, dto) {
        return await this.updateEducationUseCase.execute(id, dto);
    }
    async deleteEducation(username, id) {
        await this.deleteEducationUseCase.execute(id);
    }
    async getExperiences(username, paginationDto) {
        return await this.getExperiencesUseCase.execute(username, paginationDto);
    }
    async createExperience(username, dto) {
        return await this.createExperienceUseCase.execute(username, dto);
    }
    async updateExperience(username, id, dto) {
        return await this.updateExperienceUseCase.execute(id, dto);
    }
    async deleteExperience(username, id) {
        await this.deleteExperienceUseCase.execute(id);
    }
    async getCertificates(username, paginationDto) {
        return await this.getCertificatesUseCase.execute(username, paginationDto);
    }
    async createCertificate(username, dto) {
        return await this.createCertificateUseCase.execute(username, dto);
    }
    async updateCertificate(username, id, dto) {
        return await this.updateCertificateUseCase.execute(id, dto);
    }
    async deleteCertificate(username, id) {
        await this.deleteCertificateUseCase.execute(id);
    }
    async linkCertificateToEducation(username, certificateId, educationId) {
        await this.linkCertificateToEducationUseCase.execute(username, certificateId, educationId);
    }
    async unlinkCertificateFromEducation(username, certificateId, educationId) {
        await this.unlinkCertificateFromEducationUseCase.execute(username, certificateId, educationId);
    }
    async getReferences(username, paginationDto) {
        return await this.getReferencesUseCase.execute(username, paginationDto);
    }
    async createReference(username, dto) {
        return await this.createReferenceUseCase.execute(username, dto);
    }
    async updateReference(username, id, dto) {
        return await this.updateReferenceUseCase.execute(id, dto);
    }
    async deleteReference(username, id) {
        await this.deleteReferenceUseCase.execute(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => user_entity_1.User }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [user_not_found_exception_1.UserNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => user_entity_1.User }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [user_not_found_exception_1.UserNotFoundException, invalid_current_password_exception_1.InvalidCurrentPasswordException, email_already_exists_exception_1.EmailAlreadyExistsException, username_already_exists_exception_1.UsernameAlreadyExistsException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('about-me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [user_not_found_exception_1.UserNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAboutMe", null);
__decorate([
    (0, common_1.Patch)('about-me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [component_not_found_exceptions_1.ComponentNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_component_about_me_dto_1.UpdateUserComponentAboutMeDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateAboutMe", null);
__decorate([
    (0, common_1.Get)('educations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [user_not_found_exception_1.UserNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getEducations", null);
__decorate([
    (0, common_1.Post)('educations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [invalid_education_dates_exception_1.InvalidEducationDatesException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_user_component_education_dto_1.CreateUserComponentEducationDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createEducation", null);
__decorate([
    (0, common_1.Put)('educations/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [component_not_found_exceptions_1.ComponentNotFoundException, invalid_education_dates_exception_1.InvalidEducationDatesException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, update_user_component_education_dto_1.UpdateUserComponentEducationDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateEducation", null);
__decorate([
    (0, common_1.Delete)('educations/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [component_not_found_exceptions_1.ComponentNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteEducation", null);
__decorate([
    (0, common_1.Get)('experiences'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [user_not_found_exception_1.UserNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getExperiences", null);
__decorate([
    (0, common_1.Post)('experiences'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [invalid_experience_position_dates_exception_1.InvalidExperiencePositionDatesException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_user_component_experience_dto_1.CreateUserComponentExperienceDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createExperience", null);
__decorate([
    (0, common_1.Put)('experiences/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [component_not_found_exceptions_1.ComponentNotFoundException, invalid_experience_position_dates_exception_1.InvalidExperiencePositionDatesException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, update_user_component_experience_dto_1.UpdateUserComponentExperienceDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateExperience", null);
__decorate([
    (0, common_1.Delete)('experiences/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [component_not_found_exceptions_1.ComponentNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteExperience", null);
__decorate([
    (0, common_1.Get)('certificates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [user_not_found_exception_1.UserNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCertificates", null);
__decorate([
    (0, common_1.Post)('certificates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => unauthorized_access_exception_1.UnauthorizedAccessException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_user_component_certificate_dto_1.CreateUserComponentCertificateDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createCertificate", null);
__decorate([
    (0, common_1.Put)('certificates/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [component_not_found_exceptions_1.ComponentNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, update_user_component_certificate_dto_1.UpdateUserComponentCertificateDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateCertificate", null);
__decorate([
    (0, common_1.Delete)('certificates/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [component_not_found_exceptions_1.ComponentNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteCertificate", null);
__decorate([
    (0, common_1.Post)('certificates/:certificateId/link-education/:educationId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [component_not_found_exceptions_1.ComponentNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('certificateId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('educationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "linkCertificateToEducation", null);
__decorate([
    (0, common_1.Delete)('certificates/:certificateId/unlink-education/:educationId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [component_not_found_exceptions_1.ComponentNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('certificateId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('educationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "unlinkCertificateFromEducation", null);
__decorate([
    (0, common_1.Get)('references'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => unauthorized_access_exception_1.UnauthorizedAccessException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getReferences", null);
__decorate([
    (0, common_1.Post)('references'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => unauthorized_access_exception_1.UnauthorizedAccessException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_user_component_reference_dto_1.CreateUserComponentReferenceDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createReference", null);
__decorate([
    (0, common_1.Put)('references/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [component_not_found_exceptions_1.ComponentNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, update_user_component_reference_dto_1.UpdateUserComponentReferenceDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateReference", null);
__decorate([
    (0, common_1.Delete)('references/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [component_not_found_exceptions_1.ComponentNotFoundException, unauthorized_access_exception_1.UnauthorizedAccessException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteReference", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(':username/users'),
    (0, swagger_1.ApiTags)('Administration Users'),
    __metadata("design:paramtypes", [about_me_use_case_1.GetAboutMeUseCase,
        get_profile_use_case_1.GetProfileUseCase,
        education_use_case_1.GetEducationsUseCase,
        about_me_use_case_1.UpdateAboutMeUseCase,
        update_profile_use_case_1.UpdateProfileUseCase,
        experience_use_case_1.GetExperiencesUseCase,
        education_use_case_1.CreateEducationUseCase,
        education_use_case_1.DeleteEducationUseCase,
        certificate_use_case_1.GetCertificatesUseCase,
        education_use_case_1.UpdateEducationUseCase,
        experience_use_case_1.CreateExperienceUseCase,
        experience_use_case_1.DeleteExperienceUseCase,
        experience_use_case_1.UpdateExperienceUseCase,
        certificate_use_case_1.CreateCertificateUseCase,
        certificate_use_case_1.DeleteCertificateUseCase,
        certificate_use_case_1.UpdateCertificateUseCase,
        link_certificate_education_use_case_1.LinkCertificateToEducationUseCase,
        unlink_certificate_education_use_case_1.UnlinkCertificateFromEducationUseCase,
        reference_use_case_1.GetReferencesUseCase,
        reference_use_case_1.CreateReferenceUseCase,
        reference_use_case_1.DeleteReferenceUseCase,
        reference_use_case_1.UpdateReferenceUseCase])
], UsersController);
;
//# sourceMappingURL=users.controller.js.map
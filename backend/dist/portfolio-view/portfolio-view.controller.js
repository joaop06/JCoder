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
exports.PortfolioViewController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const create_user_dto_1 = require("./dto/create-user.dto");
const get_educations_dto_1 = require("./dto/get-educations.dto");
const get_references_dto_1 = require("./dto/get-references.dto");
const pagination_dto_1 = require("../@common/dto/pagination.dto");
const get_experiences_dto_1 = require("./dto/get-experiences.dto");
const get_applications_dto_1 = require("./dto/get-applications.dto");
const get_certificates_dto_1 = require("./dto/get-certificates.dto");
const get_technologies_dto_1 = require("./dto/get-technologies.dto");
const verify_email_code_dto_1 = require("./dto/verify-email-code.dto");
const create_user_use_case_1 = require("./use-cases/create-user.use-case");
const get_educations_use_case_1 = require("./use-cases/get-educations.use-case");
const get_references_use_case_1 = require("./use-cases/get-references.use-case");
const user_entity_1 = require("../administration-by-user/users/entities/user.entity");
const register_portfolio_view_dto_1 = require("./dto/register-portfolio-view.dto");
const get_application_details_dto_1 = require("./dto/get-application-details.dto");
const get_experiences_use_case_1 = require("./use-cases/get-experiences.use-case");
const send_email_verification_dto_1 = require("./dto/send-email-verification.dto");
const swagger_1 = require("@nestjs/swagger");
const check_email_availability_dto_1 = require("./dto/check-email-availability.dto");
const get_applications_use_case_1 = require("./use-cases/get-applications.use-case");
const get_certificates_use_case_1 = require("./use-cases/get-certificates.use-case");
const get_profile_with_about_me_dto_1 = require("./dto/get-profile-with-about-me.dto");
const get_technologies_use_case_1 = require("./use-cases/get-technologies.use-case");
const verify_email_code_use_case_1 = require("./use-cases/verify-email-code.use-case");
const check_username_availability_dto_1 = require("./dto/check-username-availability.dto");
const get_application_details_use_case_1 = require("./use-cases/get-application-details.use-case");
const register_portfolio_view_use_case_1 = require("./use-cases/register-portfolio-view.use-case");
const send_email_verification_use_case_1 = require("./use-cases/send-email-verification.use-case");
const create_message_dto_1 = require("../administration-by-user/messages/dto/create-message.dto");
const check_email_availability_use_case_1 = require("./use-cases/check-email-availability.use-case");
const get_profile_with_about_me_use_case_1 = require("./use-cases/get-profile-with-about-me.use-case");
const check_username_availability_use_case_1 = require("./use-cases/check-username-availability.use-case");
const api_exception_response_decorator_1 = require("../@common/decorators/documentation/api-exception-response.decorator");
const create_message_use_case_1 = require("../administration-by-user/messages/use-cases/create-message.use-case");
const user_not_found_exception_1 = require("../administration-by-user/users/exceptions/user-not-found.exception");
const email_already_exists_exception_1 = require("../administration-by-user/users/exceptions/email-already-exists.exception");
const username_already_exists_exception_1 = require("../administration-by-user/users/exceptions/username-already-exists.exception");
const technology_not_found_exception_1 = require("../administration-by-user/technologies/exceptions/technology-not-found.exception");
const application_not_found_exception_1 = require("../administration-by-user/applications/exceptions/application-not-found.exception");
let PortfolioViewController = class PortfolioViewController {
    constructor(createUserUseCase, createMessageUseCase, getEducationsUseCase, getReferencesUseCase, getExperiencesUseCase, getApplicationsUseCase, getCertificatesUseCase, getTechnologiesUseCase, verifyEmailCodeUseCase, getApplicationDetailsUseCase, getProfileWithAboutMeUseCase, registerPortfolioViewUseCase, sendEmailVerificationUseCase, checkEmailAvailabilityUseCase, checkUsernameAvailabilityUseCase) {
        this.createUserUseCase = createUserUseCase;
        this.createMessageUseCase = createMessageUseCase;
        this.getEducationsUseCase = getEducationsUseCase;
        this.getReferencesUseCase = getReferencesUseCase;
        this.getExperiencesUseCase = getExperiencesUseCase;
        this.getApplicationsUseCase = getApplicationsUseCase;
        this.getCertificatesUseCase = getCertificatesUseCase;
        this.getTechnologiesUseCase = getTechnologiesUseCase;
        this.verifyEmailCodeUseCase = verifyEmailCodeUseCase;
        this.getApplicationDetailsUseCase = getApplicationDetailsUseCase;
        this.getProfileWithAboutMeUseCase = getProfileWithAboutMeUseCase;
        this.registerPortfolioViewUseCase = registerPortfolioViewUseCase;
        this.sendEmailVerificationUseCase = sendEmailVerificationUseCase;
        this.checkEmailAvailabilityUseCase = checkEmailAvailabilityUseCase;
        this.checkUsernameAvailabilityUseCase = checkUsernameAvailabilityUseCase;
    }
    async checkUsernameAvailability(username) {
        return await this.checkUsernameAvailabilityUseCase.execute(username);
    }
    async checkEmailAvailability(email) {
        return await this.checkEmailAvailabilityUseCase.execute(email);
    }
    async sendEmailVerification(dto) {
        return await this.sendEmailVerificationUseCase.execute(dto);
    }
    async verifyEmailCode(dto) {
        return await this.verifyEmailCodeUseCase.execute(dto);
    }
    async createUser(createUserDto) {
        return await this.createUserUseCase.execute(createUserDto);
    }
    async createMessage(username, createMessageDto) {
        return await this.createMessageUseCase.execute(username, createMessageDto);
    }
    async getProfileWithAboutMe(username) {
        return await this.getProfileWithAboutMeUseCase.execute(username);
    }
    async getEducations(username, paginationDto) {
        return await this.getEducationsUseCase.execute(username, paginationDto);
    }
    async getExperiences(username, paginationDto) {
        return await this.getExperiencesUseCase.execute(username, paginationDto);
    }
    async getCertificates(username, paginationDto) {
        return await this.getCertificatesUseCase.execute(username, paginationDto);
    }
    async getApplications(username, paginationDto) {
        return await this.getApplicationsUseCase.execute(username, paginationDto);
    }
    async getApplicationDetails(username, id) {
        return await this.getApplicationDetailsUseCase.execute(id, username);
    }
    async getReferences(username, paginationDto) {
        return await this.getReferencesUseCase.execute(username, paginationDto);
    }
    async getTechnologies(username, paginationDto) {
        return await this.getTechnologiesUseCase.execute(username, paginationDto);
    }
    async registerPortfolioView(username, dto, request) {
        return await this.registerPortfolioViewUseCase.execute(username, dto, request);
    }
};
exports.PortfolioViewController = PortfolioViewController;
__decorate([
    (0, common_1.Get)('check-username/:username'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => check_username_availability_dto_1.CheckUsernameAvailabilityDto }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "checkUsernameAvailability", null);
__decorate([
    (0, common_1.Get)('check-email/:email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => check_email_availability_dto_1.CheckEmailAvailabilityDto }),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "checkEmailAvailability", null);
__decorate([
    (0, common_1.Post)('send-email-verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ short: { limit: 3, ttl: 60000 } }),
    (0, swagger_1.ApiOkResponse)({ schema: { type: 'object', properties: { message: { type: 'string' } } } }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => email_already_exists_exception_1.EmailAlreadyExistsException),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_email_verification_dto_1.SendEmailVerificationDto]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "sendEmailVerification", null);
__decorate([
    (0, common_1.Post)('verify-email-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ short: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOkResponse)({ schema: { type: 'object', properties: { verified: { type: 'boolean' }, message: { type: 'string' } } } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_code_dto_1.VerifyEmailCodeDto]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "verifyEmailCode", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, throttler_1.Throttle)({ short: { limit: 3, ttl: 60000 } }),
    (0, swagger_1.ApiOkResponse)({ type: () => user_entity_1.User }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [email_already_exists_exception_1.EmailAlreadyExistsException, username_already_exists_exception_1.UsernameAlreadyExistsException]),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "createUser", null);
__decorate([
    (0, common_1.Post)(':username/messages'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, throttler_1.Throttle)({ short: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiNoContentResponse)(),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Get)(':username/profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => get_profile_with_about_me_dto_1.GetProfileWithAboutMeDto }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => user_not_found_exception_1.UserNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "getProfileWithAboutMe", null);
__decorate([
    (0, common_1.Get)(':username/educations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => get_educations_dto_1.GetEducationsDto }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => user_not_found_exception_1.UserNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "getEducations", null);
__decorate([
    (0, common_1.Get)(':username/experiences'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => get_experiences_dto_1.GetExperiencesDto }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => user_not_found_exception_1.UserNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "getExperiences", null);
__decorate([
    (0, common_1.Get)(':username/certificates'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => get_certificates_dto_1.GetCertificatesDto }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => user_not_found_exception_1.UserNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "getCertificates", null);
__decorate([
    (0, common_1.Get)(':username/applications'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => get_applications_dto_1.GetApplicationsDto }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => user_not_found_exception_1.UserNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Get)(':username/applications/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => get_application_details_dto_1.GetApplicationDetailsDto }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [user_not_found_exception_1.UserNotFoundException, application_not_found_exception_1.ApplicationNotFoundException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "getApplicationDetails", null);
__decorate([
    (0, common_1.Get)(':username/references'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => get_references_dto_1.GetReferencesDto }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => user_not_found_exception_1.UserNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "getReferences", null);
__decorate([
    (0, common_1.Get)(':username/technologies'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({ type: () => get_technologies_dto_1.GetTechnologiesDto }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [user_not_found_exception_1.UserNotFoundException, technology_not_found_exception_1.TechnologyNotFoundException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "getTechnologies", null);
__decorate([
    (0, common_1.Post)(':username/track-view'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, throttler_1.Throttle)({ short: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => user_not_found_exception_1.UserNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, register_portfolio_view_dto_1.RegisterPortfolioViewDto, Object]),
    __metadata("design:returntype", Promise)
], PortfolioViewController.prototype, "registerPortfolioView", null);
exports.PortfolioViewController = PortfolioViewController = __decorate([
    (0, swagger_1.ApiTags)('Portfolio View'),
    (0, common_1.Controller)('portfolio'),
    __metadata("design:paramtypes", [create_user_use_case_1.CreateUserUseCase,
        create_message_use_case_1.CreateMessageUseCase,
        get_educations_use_case_1.GetEducationsUseCase,
        get_references_use_case_1.GetReferencesUseCase,
        get_experiences_use_case_1.GetExperiencesUseCase,
        get_applications_use_case_1.GetApplicationsUseCase,
        get_certificates_use_case_1.GetCertificatesUseCase,
        get_technologies_use_case_1.GetTechnologiesUseCase,
        verify_email_code_use_case_1.VerifyEmailCodeUseCase,
        get_application_details_use_case_1.GetApplicationDetailsUseCase,
        get_profile_with_about_me_use_case_1.GetProfileWithAboutMeUseCase,
        register_portfolio_view_use_case_1.RegisterPortfolioViewUseCase,
        send_email_verification_use_case_1.SendEmailVerificationUseCase,
        check_email_availability_use_case_1.CheckEmailAvailabilityUseCase,
        check_username_availability_use_case_1.CheckUsernameAvailabilityUseCase])
], PortfolioViewController);
;
//# sourceMappingURL=portfolio-view.controller.js.map
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
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const application_entity_1 = require("./entities/application.entity");
const applications_service_1 = require("./applications.service");
const jwt_auth_guard_1 = require("../../@common/guards/jwt-auth.guard");
const applications_stats_dto_1 = require("./dto/applications-stats.dto");
const create_application_dto_1 = require("./dto/create-application.dto");
const update_application_dto_1 = require("./dto/update-application.dto");
const reorder_application_dto_1 = require("./dto/reorder-application.dto");
const create_application_use_case_1 = require("./use-cases/create-application.use-case");
const delete_application_use_case_1 = require("./use-cases/delete-application.use-case");
const update_application_use_case_1 = require("./use-cases/update-application.use-case");
const reorder_application_use_case_1 = require("./use-cases/reorder-application.use-case");
const pagination_dto_1 = require("../../@common/dto/pagination.dto");
const application_not_found_exception_1 = require("./exceptions/application-not-found.exception");
const swagger_1 = require("@nestjs/swagger");
const already_exists_application_exception_1 = require("./exceptions/already-exists-application-exception");
const delete_application_component_use_case_1 = require("./use-cases/delete-application-component.use-case");
const already_deleted_application_exception_1 = require("./exceptions/already-deleted-application.exception");
const api_exception_response_decorator_1 = require("../../@common/decorators/documentation/api-exception-response.decorator");
let ApplicationsController = class ApplicationsController {
    constructor(applicationsService, createApplicationUseCase, deleteApplicationUseCase, updateApplicationUseCase, reorderApplicationUseCase, deleteApplicationComponentUseCase) {
        this.applicationsService = applicationsService;
        this.createApplicationUseCase = createApplicationUseCase;
        this.deleteApplicationUseCase = deleteApplicationUseCase;
        this.updateApplicationUseCase = updateApplicationUseCase;
        this.reorderApplicationUseCase = reorderApplicationUseCase;
        this.deleteApplicationComponentUseCase = deleteApplicationComponentUseCase;
    }
    async findAll(username, paginationDto) {
        return await this.applicationsService.findAll(username, paginationDto);
    }
    async getStats(username) {
        return await this.applicationsService.getStats(username);
    }
    async findById(username, id) {
        return await this.applicationsService.findById(id, username);
    }
    async create(username, createApplicationDto) {
        return await this.createApplicationUseCase.execute(username, createApplicationDto);
    }
    async update(username, id, updateApplicationDto) {
        return await this.updateApplicationUseCase.execute(username, +id, updateApplicationDto);
    }
    async delete(username, id) {
        return await this.deleteApplicationUseCase.execute(username, +id);
    }
    async reorder(username, id, reorderApplicationDto) {
        return await this.reorderApplicationUseCase.execute(username, id, reorderApplicationDto);
    }
    async deleteApiComponent(username, id) {
        return await this.deleteApplicationComponentUseCase.execute(username, id, 'api');
    }
    async deleteMobileComponent(username, id) {
        return await this.deleteApplicationComponentUseCase.execute(username, id, 'mobile');
    }
    async deleteLibraryComponent(username, id) {
        return await this.deleteApplicationComponentUseCase.execute(username, id, 'library');
    }
    async deleteFrontendComponent(username, id) {
        return await this.deleteApplicationComponentUseCase.execute(username, id, 'frontend');
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ type: () => pagination_dto_1.PaginatedResponseDto }),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOkResponse)({ type: () => applications_stats_dto_1.ApplicationsStatsDto }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: () => application_entity_1.Application }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => application_not_found_exception_1.ApplicationNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOkResponse)({ type: () => application_entity_1.Application }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [
        application_not_found_exception_1.ApplicationNotFoundException,
        already_exists_application_exception_1.AlreadyExistsApplicationException,
    ]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_application_dto_1.CreateApplicationDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOkResponse)({ type: () => application_entity_1.Application }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [
        application_not_found_exception_1.ApplicationNotFoundException,
        already_exists_application_exception_1.AlreadyExistsApplicationException,
    ]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, update_application_dto_1.UpdateApplicationDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => already_deleted_application_exception_1.AlreadyDeletedApplicationException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)(':id/reorder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOkResponse)({ type: () => application_entity_1.Application }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [application_not_found_exception_1.ApplicationNotFoundException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, reorder_application_dto_1.ReorderApplicationDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "reorder", null);
__decorate([
    (0, common_1.Delete)(':id/components/api'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOkResponse)({ type: () => application_entity_1.Application }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [application_not_found_exception_1.ApplicationNotFoundException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "deleteApiComponent", null);
__decorate([
    (0, common_1.Delete)(':id/components/mobile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOkResponse)({ type: () => application_entity_1.Application }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [application_not_found_exception_1.ApplicationNotFoundException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "deleteMobileComponent", null);
__decorate([
    (0, common_1.Delete)(':id/components/library'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOkResponse)({ type: () => application_entity_1.Application }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [application_not_found_exception_1.ApplicationNotFoundException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "deleteLibraryComponent", null);
__decorate([
    (0, common_1.Delete)(':id/components/frontend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOkResponse)({ type: () => application_entity_1.Application }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [application_not_found_exception_1.ApplicationNotFoundException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "deleteFrontendComponent", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(':username/applications'),
    (0, swagger_1.ApiTags)('Administration Applications'),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService,
        create_application_use_case_1.CreateApplicationUseCase,
        delete_application_use_case_1.DeleteApplicationUseCase,
        update_application_use_case_1.UpdateApplicationUseCase,
        reorder_application_use_case_1.ReorderApplicationUseCase,
        delete_application_component_use_case_1.DeleteApplicationComponentUseCase])
], ApplicationsController);
;
//# sourceMappingURL=applications.controller.js.map
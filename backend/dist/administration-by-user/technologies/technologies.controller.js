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
exports.TechnologiesController = void 0;
const common_1 = require("@nestjs/common");
const technology_entity_1 = require("./entities/technology.entity");
const technologies_service_1 = require("./technologies.service");
const create_technology_dto_1 = require("./dto/create-technology.dto");
const update_technology_dto_1 = require("./dto/update-technology.dto");
const jwt_auth_guard_1 = require("../../@common/guards/jwt-auth.guard");
const reorder_technology_dto_1 = require("./dto/reorder-technology.dto");
const technologies_stats_dto_1 = require("./dto/technologies-stats.dto");
const create_technology_use_case_1 = require("./use-cases/create-technology.use-case");
const delete_technology_use_case_1 = require("./use-cases/delete-technology.use-case");
const update_technology_use_case_1 = require("./use-cases/update-technology.use-case");
const reorder_technology_use_case_1 = require("./use-cases/reorder-technology.use-case");
const pagination_dto_1 = require("../../@common/dto/pagination.dto");
const technology_not_found_exception_1 = require("./exceptions/technology-not-found.exception");
const swagger_1 = require("@nestjs/swagger");
const technology_already_exists_exception_1 = require("./exceptions/technology-already-exists.exception");
const technology_already_deleted_exception_1 = require("./exceptions/technology-already-deleted.exception");
const api_exception_response_decorator_1 = require("../../@common/decorators/documentation/api-exception-response.decorator");
let TechnologiesController = class TechnologiesController {
    constructor(technologiesService, createTechnologyUseCase, deleteTechnologyUseCase, updateTechnologyUseCase, reorderTechnologyUseCase) {
        this.technologiesService = technologiesService;
        this.createTechnologyUseCase = createTechnologyUseCase;
        this.deleteTechnologyUseCase = deleteTechnologyUseCase;
        this.updateTechnologyUseCase = updateTechnologyUseCase;
        this.reorderTechnologyUseCase = reorderTechnologyUseCase;
    }
    async findAll(username, paginationDto) {
        return await this.technologiesService.findAll(username, paginationDto);
    }
    async getStats(username) {
        return await this.technologiesService.getStats(username);
    }
    async findById(username, id) {
        return await this.technologiesService.findById(id, username);
    }
    async create(username, createTechnologyDto) {
        return await this.createTechnologyUseCase.execute(username, createTechnologyDto);
    }
    async update(username, id, updateTechnologyDto) {
        return await this.updateTechnologyUseCase.execute(id, username, updateTechnologyDto);
    }
    async delete(username, id) {
        return await this.deleteTechnologyUseCase.execute(username, id);
    }
    async reorder(username, id, reorderTechnologyDto) {
        return await this.reorderTechnologyUseCase.execute(username, id, reorderTechnologyDto);
    }
};
exports.TechnologiesController = TechnologiesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ type: () => pagination_dto_1.PaginatedResponseDto }),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], TechnologiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOkResponse)({ type: () => technologies_stats_dto_1.TechnologiesStatsDto }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TechnologiesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: () => technology_entity_1.Technology }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => technology_not_found_exception_1.TechnologyNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], TechnologiesController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOkResponse)({ type: () => technology_entity_1.Technology }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [
        technology_not_found_exception_1.TechnologyNotFoundException,
        technology_already_exists_exception_1.TechnologyAlreadyExistsException,
    ]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_technology_dto_1.CreateTechnologyDto]),
    __metadata("design:returntype", Promise)
], TechnologiesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOkResponse)({ type: () => technology_entity_1.Technology }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [
        technology_not_found_exception_1.TechnologyNotFoundException,
        technology_already_exists_exception_1.TechnologyAlreadyExistsException,
    ]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, update_technology_dto_1.UpdateTechnologyDto]),
    __metadata("design:returntype", Promise)
], TechnologiesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [
        technology_not_found_exception_1.TechnologyNotFoundException,
        technology_already_deleted_exception_1.TechnologyAlreadyDeletedException,
    ]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], TechnologiesController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)(':id/reorder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOkResponse)({ type: () => technology_entity_1.Technology }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => [technology_not_found_exception_1.TechnologyNotFoundException]),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, reorder_technology_dto_1.ReorderTechnologyDto]),
    __metadata("design:returntype", Promise)
], TechnologiesController.prototype, "reorder", null);
exports.TechnologiesController = TechnologiesController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(':username/technologies'),
    (0, swagger_1.ApiTags)('Administration Technologies'),
    __metadata("design:paramtypes", [technologies_service_1.TechnologiesService,
        create_technology_use_case_1.CreateTechnologyUseCase,
        delete_technology_use_case_1.DeleteTechnologyUseCase,
        update_technology_use_case_1.UpdateTechnologyUseCase,
        reorder_technology_use_case_1.ReorderTechnologyUseCase])
], TechnologiesController);
;
//# sourceMappingURL=technologies.controller.js.map
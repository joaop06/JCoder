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
exports.DeleteReferenceUseCase = exports.UpdateReferenceUseCase = exports.CreateReferenceUseCase = exports.GetReferencesUseCase = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users.service");
const repositories_1 = require("../repositories");
let GetReferencesUseCase = class GetReferencesUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(username, paginationDto) {
        return await this.userComponentsRepository.referenceRepository.findAll(username, paginationDto);
    }
};
exports.GetReferencesUseCase = GetReferencesUseCase;
exports.GetReferencesUseCase = GetReferencesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], GetReferencesUseCase);
;
let CreateReferenceUseCase = class CreateReferenceUseCase {
    constructor(usersService, userComponentsRepository) {
        this.usersService = usersService;
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(username, dto) {
        const user = await this.usersService.findOneBy({ username });
        return await this.userComponentsRepository.referenceRepository.create(user, dto);
    }
};
exports.CreateReferenceUseCase = CreateReferenceUseCase;
exports.CreateReferenceUseCase = CreateReferenceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        repositories_1.UserComponentsRepository])
], CreateReferenceUseCase);
;
let UpdateReferenceUseCase = class UpdateReferenceUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(id, dto) {
        return await this.userComponentsRepository.referenceRepository.update(id, dto);
    }
};
exports.UpdateReferenceUseCase = UpdateReferenceUseCase;
exports.UpdateReferenceUseCase = UpdateReferenceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], UpdateReferenceUseCase);
;
let DeleteReferenceUseCase = class DeleteReferenceUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(id) {
        await this.userComponentsRepository.referenceRepository.delete(id);
    }
};
exports.DeleteReferenceUseCase = DeleteReferenceUseCase;
exports.DeleteReferenceUseCase = DeleteReferenceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], DeleteReferenceUseCase);
;
//# sourceMappingURL=reference.use-case.js.map
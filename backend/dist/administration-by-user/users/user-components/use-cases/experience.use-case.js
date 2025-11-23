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
exports.DeleteExperienceUseCase = exports.UpdateExperienceUseCase = exports.CreateExperienceUseCase = exports.GetExperiencesUseCase = void 0;
const common_1 = require("@nestjs/common");
const repositories_1 = require("../repositories");
const users_service_1 = require("../../../users/users.service");
let GetExperiencesUseCase = class GetExperiencesUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(username, paginationDto) {
        return await this.userComponentsRepository.experienceRepository.findAll(username, paginationDto);
    }
};
exports.GetExperiencesUseCase = GetExperiencesUseCase;
exports.GetExperiencesUseCase = GetExperiencesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], GetExperiencesUseCase);
;
let CreateExperienceUseCase = class CreateExperienceUseCase {
    constructor(usersService, userComponentsRepository) {
        this.usersService = usersService;
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(username, dto) {
        const user = await this.usersService.findOneBy({ username });
        return await this.userComponentsRepository.experienceRepository.create(user, dto);
    }
};
exports.CreateExperienceUseCase = CreateExperienceUseCase;
exports.CreateExperienceUseCase = CreateExperienceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        repositories_1.UserComponentsRepository])
], CreateExperienceUseCase);
;
let UpdateExperienceUseCase = class UpdateExperienceUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(id, dto) {
        return await this.userComponentsRepository.experienceRepository.update(id, dto);
    }
};
exports.UpdateExperienceUseCase = UpdateExperienceUseCase;
exports.UpdateExperienceUseCase = UpdateExperienceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], UpdateExperienceUseCase);
;
let DeleteExperienceUseCase = class DeleteExperienceUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(id) {
        await this.userComponentsRepository.experienceRepository.delete(id);
    }
};
exports.DeleteExperienceUseCase = DeleteExperienceUseCase;
exports.DeleteExperienceUseCase = DeleteExperienceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], DeleteExperienceUseCase);
;
//# sourceMappingURL=experience.use-case.js.map
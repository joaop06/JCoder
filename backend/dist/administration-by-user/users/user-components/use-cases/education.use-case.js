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
exports.DeleteEducationUseCase = exports.UpdateEducationUseCase = exports.CreateEducationUseCase = exports.GetEducationsUseCase = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users.service");
const repositories_1 = require("../repositories");
let GetEducationsUseCase = class GetEducationsUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(username, paginationDto) {
        return await this.userComponentsRepository.educationRepository.findAll(username, paginationDto);
    }
};
exports.GetEducationsUseCase = GetEducationsUseCase;
exports.GetEducationsUseCase = GetEducationsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], GetEducationsUseCase);
;
let CreateEducationUseCase = class CreateEducationUseCase {
    constructor(usersService, userComponentsRepository) {
        this.usersService = usersService;
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(username, dto) {
        const user = await this.usersService.findOneBy({ username });
        return await this.userComponentsRepository.educationRepository.create(user, dto);
    }
};
exports.CreateEducationUseCase = CreateEducationUseCase;
exports.CreateEducationUseCase = CreateEducationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        repositories_1.UserComponentsRepository])
], CreateEducationUseCase);
;
let UpdateEducationUseCase = class UpdateEducationUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(id, dto) {
        return await this.userComponentsRepository.educationRepository.update(id, dto);
    }
};
exports.UpdateEducationUseCase = UpdateEducationUseCase;
exports.UpdateEducationUseCase = UpdateEducationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], UpdateEducationUseCase);
;
let DeleteEducationUseCase = class DeleteEducationUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(id) {
        await this.userComponentsRepository.educationRepository.delete(id);
    }
};
exports.DeleteEducationUseCase = DeleteEducationUseCase;
exports.DeleteEducationUseCase = DeleteEducationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], DeleteEducationUseCase);
;
//# sourceMappingURL=education.use-case.js.map
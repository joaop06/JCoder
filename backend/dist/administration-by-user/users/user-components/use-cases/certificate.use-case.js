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
exports.DeleteCertificateUseCase = exports.UpdateCertificateUseCase = exports.CreateCertificateUseCase = exports.GetCertificatesUseCase = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users.service");
const repositories_1 = require("../repositories");
let GetCertificatesUseCase = class GetCertificatesUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(username, paginationDto) {
        return await this.userComponentsRepository.certificateRepository.findAll(username, paginationDto);
    }
};
exports.GetCertificatesUseCase = GetCertificatesUseCase;
exports.GetCertificatesUseCase = GetCertificatesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], GetCertificatesUseCase);
;
let CreateCertificateUseCase = class CreateCertificateUseCase {
    constructor(usersService, userComponentsRepository) {
        this.usersService = usersService;
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(username, dto) {
        const user = await this.usersService.findOneBy({ username });
        return await this.userComponentsRepository.certificateRepository.create(user, dto);
    }
};
exports.CreateCertificateUseCase = CreateCertificateUseCase;
exports.CreateCertificateUseCase = CreateCertificateUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        repositories_1.UserComponentsRepository])
], CreateCertificateUseCase);
;
let UpdateCertificateUseCase = class UpdateCertificateUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(id, dto) {
        return await this.userComponentsRepository.certificateRepository.update(id, dto);
    }
};
exports.UpdateCertificateUseCase = UpdateCertificateUseCase;
exports.UpdateCertificateUseCase = UpdateCertificateUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], UpdateCertificateUseCase);
;
let DeleteCertificateUseCase = class DeleteCertificateUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(id) {
        await this.userComponentsRepository.certificateRepository.delete(id);
    }
};
exports.DeleteCertificateUseCase = DeleteCertificateUseCase;
exports.DeleteCertificateUseCase = DeleteCertificateUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], DeleteCertificateUseCase);
;
//# sourceMappingURL=certificate.use-case.js.map
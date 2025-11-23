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
exports.CreateTechnologyUseCase = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users/users.service");
const technologies_service_1 = require("../technologies.service");
const technology_already_exists_exception_1 = require("../exceptions/technology-already-exists.exception");
let CreateTechnologyUseCase = class CreateTechnologyUseCase {
    constructor(usersService, technologiesService) {
        this.usersService = usersService;
        this.technologiesService = technologiesService;
    }
    async execute(username, createTechnologyDto) {
        await this.existsTechnologyName(username, createTechnologyDto.name);
        const user = await this.usersService.findOneBy({ username });
        await this.technologiesService.incrementDisplayOrderFrom(1, user.id);
        const technologyData = {
            ...createTechnologyDto,
            userId: user.id,
            displayOrder: 1,
        };
        return await this.technologiesService.create(technologyData);
    }
    async existsTechnologyName(username, name) {
        if (!name)
            return;
        const exists = await this.technologiesService.existsByTechnologyNameAndUsername(username, name);
        if (exists)
            throw new technology_already_exists_exception_1.TechnologyAlreadyExistsException();
    }
};
exports.CreateTechnologyUseCase = CreateTechnologyUseCase;
exports.CreateTechnologyUseCase = CreateTechnologyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        technologies_service_1.TechnologiesService])
], CreateTechnologyUseCase);
;
//# sourceMappingURL=create-technology.use-case.js.map
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
exports.UpdateAboutMeUseCase = exports.GetAboutMeUseCase = void 0;
const common_1 = require("@nestjs/common");
const repositories_1 = require("../repositories");
let GetAboutMeUseCase = class GetAboutMeUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(username) {
        return await this.userComponentsRepository.aboutMeRepository.findByUsername(username);
    }
};
exports.GetAboutMeUseCase = GetAboutMeUseCase;
exports.GetAboutMeUseCase = GetAboutMeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], GetAboutMeUseCase);
;
let UpdateAboutMeUseCase = class UpdateAboutMeUseCase {
    constructor(userComponentsRepository) {
        this.userComponentsRepository = userComponentsRepository;
    }
    async execute(username, dto) {
        return await this.userComponentsRepository.aboutMeRepository.update(username, dto);
    }
};
exports.UpdateAboutMeUseCase = UpdateAboutMeUseCase;
exports.UpdateAboutMeUseCase = UpdateAboutMeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserComponentsRepository])
], UpdateAboutMeUseCase);
;
//# sourceMappingURL=about-me.use-case.js.map
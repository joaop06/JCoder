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
exports.ReorderApplicationUseCase = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users/users.service");
const applications_service_1 = require("../applications.service");
let ReorderApplicationUseCase = class ReorderApplicationUseCase {
    constructor(applicationsService, usersService) {
        this.applicationsService = applicationsService;
        this.usersService = usersService;
    }
    async execute(username, id, reorderApplicationDto) {
        const existingApplication = await this.applicationsService.findById(id, username);
        if (reorderApplicationDto.displayOrder === existingApplication.displayOrder) {
            return existingApplication;
        }
        await this.applicationsService.reorderOnUpdate(id, existingApplication.displayOrder, reorderApplicationDto.displayOrder, username);
        await this.applicationsService.update(id, {
            displayOrder: reorderApplicationDto.displayOrder,
        });
        return await this.applicationsService.findById(id, username);
    }
};
exports.ReorderApplicationUseCase = ReorderApplicationUseCase;
exports.ReorderApplicationUseCase = ReorderApplicationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService,
        users_service_1.UsersService])
], ReorderApplicationUseCase);
;
//# sourceMappingURL=reorder-application.use-case.js.map
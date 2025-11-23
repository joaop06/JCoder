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
exports.DeleteApplicationUseCase = void 0;
const common_1 = require("@nestjs/common");
const applications_service_1 = require("../applications.service");
const already_deleted_application_exception_1 = require("../exceptions/already-deleted-application.exception");
let DeleteApplicationUseCase = class DeleteApplicationUseCase {
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    async execute(username, id) {
        let application;
        try {
            application = await this.applicationsService.findById(id, username);
        }
        catch {
            throw new already_deleted_application_exception_1.AlreadyDeletedApplicationException();
        }
        const deletedDisplayOrder = application.displayOrder;
        await this.applicationsService.delete(id);
        await this.applicationsService.decrementDisplayOrderAfter(deletedDisplayOrder, username);
    }
};
exports.DeleteApplicationUseCase = DeleteApplicationUseCase;
exports.DeleteApplicationUseCase = DeleteApplicationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], DeleteApplicationUseCase);
;
//# sourceMappingURL=delete-application.use-case.js.map
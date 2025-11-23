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
exports.GetEducationsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../../@common/dto/pagination.dto");
const user_component_education_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-education.entity");
class GetEducationsDto extends pagination_dto_1.PaginatedResponseDto {
}
exports.GetEducationsDto = GetEducationsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        isArray: true,
        type: () => user_component_education_entity_1.UserComponentEducation,
        description: 'List of user educations',
    }),
    __metadata("design:type", Array)
], GetEducationsDto.prototype, "data", void 0);
;
//# sourceMappingURL=get-educations.dto.js.map
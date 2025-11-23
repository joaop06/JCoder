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
exports.GetCertificatesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../../@common/dto/pagination.dto");
const user_component_certificate_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-certificate.entity");
class GetCertificatesDto extends pagination_dto_1.PaginatedResponseDto {
}
exports.GetCertificatesDto = GetCertificatesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        isArray: true,
        type: () => user_component_certificate_entity_1.UserComponentCertificate,
        description: 'List of user certificates',
    }),
    __metadata("design:type", Array)
], GetCertificatesDto.prototype, "data", void 0);
;
//# sourceMappingURL=get-certificates.dto.js.map
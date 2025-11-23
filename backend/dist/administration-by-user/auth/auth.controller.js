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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const sign_in_dto_1 = require("./dto/sign-in.dto");
const swagger_1 = require("@nestjs/swagger");
const sign_in_use_case_1 = require("./use-cases/sign-in.use-case");
const sign_in_response_dto_1 = require("./dto/sign-in-response.dto");
const password_does_not_match_exception_1 = require("./exceptions/password-does-not-match.exception");
const api_exception_response_decorator_1 = require("../../@common/decorators/documentation/api-exception-response.decorator");
let AuthController = class AuthController {
    constructor(signInUseCase) {
        this.signInUseCase = signInUseCase;
    }
    async signIn(signInDto) {
        return await this.signInUseCase.execute(signInDto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('sign-in'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ short: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOkResponse)({ type: () => sign_in_response_dto_1.SignInResponseDto }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => password_does_not_match_exception_1.PasswordDoesNotMatchException),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sign_in_dto_1.SignInDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [sign_in_use_case_1.SignInUseCase])
], AuthController);
;
//# sourceMappingURL=auth.controller.js.map
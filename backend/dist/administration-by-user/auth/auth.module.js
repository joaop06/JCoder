"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const dotenv_1 = require("dotenv");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const auth_controller_1 = require("./auth.controller");
const users_module_1 = require("../users/users.module");
const sign_in_use_case_1 = require("./use-cases/sign-in.use-case");
const jwt_strategy_1 = require("../../@common/strategies/jwt.strategy");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        controllers: [auth_controller_1.AuthController],
        providers: [jwt_strategy_1.JwtStrategy, sign_in_use_case_1.SignInUseCase],
        imports: [
            users_module_1.UsersModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                signOptions: { expiresIn: '60m' },
                secret: configService.get("BACKEND_JWT_SECRET") || 'default-secret',
            }),
        ],
    })
], AuthModule);
;
//# sourceMappingURL=auth.module.js.map
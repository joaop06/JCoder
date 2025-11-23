"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const user_entity_1 = require("./entities/user.entity");
const users_service_1 = require("./users.service");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const users_controller_1 = require("./users.controller");
const images_module_1 = require("../images/images.module");
const owner_guard_1 = require("../../@common/guards/owner.guard");
const get_profile_use_case_1 = require("./use-cases/get-profile.use-case");
const update_profile_use_case_1 = require("./use-cases/update-profile.use-case");
const user_components_module_1 = require("./user-components/user-components.module");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        providers: [
            owner_guard_1.OwnerGuard,
            users_service_1.UsersService,
            get_profile_use_case_1.GetProfileUseCase,
            update_profile_use_case_1.UpdateProfileUseCase,
        ],
        exports: [users_service_1.UsersService],
        controllers: [users_controller_1.UsersController],
        imports: [
            images_module_1.ImagesModule,
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            (0, common_1.forwardRef)(() => user_components_module_1.UserComponentsModule),
        ],
    })
], UsersModule);
;
//# sourceMappingURL=users.module.js.map
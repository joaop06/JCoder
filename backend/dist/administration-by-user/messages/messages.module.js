"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const message_entity_1 = require("./entities/message.entity");
const conversation_entity_1 = require("./entities/conversation.entity");
const users_module_1 = require("../users/users.module");
const messages_service_1 = require("./messages.service");
const email_module_1 = require("../../email/email.module");
const messages_controller_1 = require("./messages.controller");
const owner_guard_1 = require("../../@common/guards/owner.guard");
const create_message_use_case_1 = require("./use-cases/create-message.use-case");
let MessagesModule = class MessagesModule {
};
exports.MessagesModule = MessagesModule;
exports.MessagesModule = MessagesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            email_module_1.EmailModule,
            users_module_1.UsersModule,
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([message_entity_1.Message, conversation_entity_1.Conversation]),
        ],
        exports: [messages_service_1.MessagesService, create_message_use_case_1.CreateMessageUseCase],
        controllers: [messages_controller_1.MessagesController],
        providers: [messages_service_1.MessagesService, create_message_use_case_1.CreateMessageUseCase, owner_guard_1.OwnerGuard],
    })
], MessagesModule);
;
//# sourceMappingURL=messages.module.js.map
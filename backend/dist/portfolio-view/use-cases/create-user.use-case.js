"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserUseCase = void 0;
const bcrypt = __importStar(require("bcrypt"));
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const email_verification_entity_1 = require("../entities/email-verification.entity");
const user_entity_1 = require("../../administration-by-user/users/entities/user.entity");
const users_service_1 = require("../../administration-by-user/users/users.service");
const email_already_exists_exception_1 = require("../../administration-by-user/users/exceptions/email-already-exists.exception");
const username_already_exists_exception_1 = require("../../administration-by-user/users/exceptions/username-already-exists.exception");
const user_component_about_me_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-about-me.entity");
let CreateUserUseCase = class CreateUserUseCase {
    constructor(usersService, userRepository, aboutMeRepository, emailVerificationRepository) {
        this.usersService = usersService;
        this.userRepository = userRepository;
        this.aboutMeRepository = aboutMeRepository;
        this.emailVerificationRepository = emailVerificationRepository;
    }
    async execute(createUserDto) {
        const usernameExists = await this.usersService.existsBy({ username: createUserDto.username });
        if (usernameExists) {
            throw new username_already_exists_exception_1.UsernameAlreadyExistsException();
        }
        const emailExists = await this.usersService.existsBy({ email: createUserDto.email });
        if (emailExists) {
            throw new email_already_exists_exception_1.EmailAlreadyExistsException();
        }
        const emailVerification = await this.emailVerificationRepository.findOne({
            where: {
                email: createUserDto.email,
                verified: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
        if (!emailVerification) {
            throw new common_1.BadRequestException('Email not verified. Please verify your email before creating the account.');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const newUser = this.userRepository.create({
            username: createUserDto.username,
            password: hashedPassword,
            email: createUserDto.email,
            firstName: createUserDto.firstName,
            fullName: createUserDto.fullName,
            githubUrl: createUserDto.githubUrl,
            linkedinUrl: createUserDto.linkedinUrl,
        });
        const savedUser = await this.userRepository.save(newUser);
        const aboutMe = this.aboutMeRepository.create({
            userId: savedUser.id,
            user: savedUser,
            occupation: createUserDto.occupation,
            description: createUserDto.description,
        });
        await this.aboutMeRepository.save(aboutMe);
        const { password, ...userWithoutPassword } = savedUser;
        return userWithoutPassword;
    }
};
exports.CreateUserUseCase = CreateUserUseCase;
exports.CreateUserUseCase = CreateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_2.InjectRepository)(user_component_about_me_entity_1.UserComponentAboutMe)),
    __param(3, (0, typeorm_2.InjectRepository)(email_verification_entity_1.EmailVerification)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], CreateUserUseCase);
;
//# sourceMappingURL=create-user.use-case.js.map
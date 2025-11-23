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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileUseCase = void 0;
const bcrypt = __importStar(require("bcrypt"));
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users.service");
const email_already_exists_exception_1 = require("../exceptions/email-already-exists.exception");
const username_already_exists_exception_1 = require("../exceptions/username-already-exists.exception");
const invalid_current_password_exception_1 = require("../exceptions/invalid-current-password.exception");
let UpdateProfileUseCase = class UpdateProfileUseCase {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async execute(username, updateProfileDto) {
        const user = await this.usersService.findOneBy({ username });
        if (updateProfileDto.newPassword) {
            if (!updateProfileDto.currentPassword) {
                throw new invalid_current_password_exception_1.InvalidCurrentPasswordException();
            }
            const isValidPassword = await bcrypt.compare(updateProfileDto.currentPassword, user.password);
            if (!isValidPassword) {
                throw new invalid_current_password_exception_1.InvalidCurrentPasswordException();
            }
            const hashedPassword = await bcrypt.hash(updateProfileDto.newPassword, 10);
            user.password = hashedPassword;
        }
        if (updateProfileDto.username && updateProfileDto.username !== user.username) {
            const usernameExists = await this.usersService.existsBy({ username: updateProfileDto.username });
            if (usernameExists) {
                throw new username_already_exists_exception_1.UsernameAlreadyExistsException();
            }
            user.username = updateProfileDto.username;
        }
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const emailExists = await this.usersService.existsBy({ email: updateProfileDto.email });
            if (emailExists) {
                throw new email_already_exists_exception_1.EmailAlreadyExistsException();
            }
            user.email = updateProfileDto.email;
        }
        if (updateProfileDto.firstName !== undefined) {
            user.firstName = updateProfileDto.firstName;
        }
        if (updateProfileDto.fullName !== undefined) {
            user.fullName = updateProfileDto.fullName;
        }
        if (updateProfileDto.githubUrl !== undefined) {
            user.githubUrl = updateProfileDto.githubUrl;
        }
        if (updateProfileDto.linkedinUrl !== undefined) {
            user.linkedinUrl = updateProfileDto.linkedinUrl;
        }
        if (updateProfileDto.profileImage !== undefined) {
            user.profileImage = updateProfileDto.profileImage;
        }
        if (updateProfileDto.phone !== undefined) {
            user.phone = updateProfileDto.phone;
        }
        if (updateProfileDto.address !== undefined) {
            user.address = updateProfileDto.address;
        }
        return await this.usersService.update(user);
    }
};
exports.UpdateProfileUseCase = UpdateProfileUseCase;
exports.UpdateProfileUseCase = UpdateProfileUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UpdateProfileUseCase);
;
//# sourceMappingURL=update-profile.use-case.js.map
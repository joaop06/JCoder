import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module, forwardRef } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UserImageService } from "./services/user-image.service";
import { GetProfileUseCase } from "./use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "./use-cases/update-profile.use-case";
import { UserComponentsModule } from "./user-components/user-components.module";
import { UploadUserProfileImageUseCase } from "./use-cases/upload-user-profile-image.use-case";

@Module({
    providers: [
        UsersService,
        UserImageService,
        GetProfileUseCase,
        UpdateProfileUseCase,
        UploadUserProfileImageUseCase,
    ],
    exports: [UsersService],
    controllers: [UsersController],
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => UserComponentsModule),
    ],
})
export class UsersModule { };

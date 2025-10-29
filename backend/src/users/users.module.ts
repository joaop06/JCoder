import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module, forwardRef } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { GetProfileUseCase } from "./use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "./use-cases/update-profile.use-case";
import { UserComponentsModule } from "./user-components/user-components.module";

@Module({
    providers: [
        UsersService,
        GetProfileUseCase,
        UpdateProfileUseCase,
    ],
    exports: [UsersService],
    controllers: [UsersController],
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => UserComponentsModule),
    ],
})
export class UsersModule { };

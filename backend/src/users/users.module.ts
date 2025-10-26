import { Module } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./users.controller";
import { GetProfileUseCase } from "./use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "./use-cases/update-profile.use-case";

@Module({
    controllers: [UsersController],
    exports: [UsersService],
    providers: [
        UsersService,
        GetProfileUseCase,
        UpdateProfileUseCase,
    ],
    imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule { };

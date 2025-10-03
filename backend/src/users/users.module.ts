import { Module } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    exports: [UsersService],
    providers: [UsersService],
    imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule { };

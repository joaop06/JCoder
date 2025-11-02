import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsService } from '../user-components.service';
import { UserComponentAboutMe } from '../entities/user-component-about-me.entity';
import { UpdateUserComponentAboutMeDto } from '../dto/update-user-component-about-me.dto';

@Injectable()
export class GetAboutMeUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(username: string): Promise<UserComponentAboutMe | null> {
        const userId = await this.usersService.findUserIdByUsername(username);
        return await this.userComponentsService.getAboutMe(userId);
    }
};

@Injectable()
export class UpdateAboutMeUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(username: string, dto: UpdateUserComponentAboutMeDto): Promise<UserComponentAboutMe> {
        const userId = await this.usersService.findUserIdByUsername(username);
        return await this.userComponentsService.updateAboutMe(userId, dto);
    }
};

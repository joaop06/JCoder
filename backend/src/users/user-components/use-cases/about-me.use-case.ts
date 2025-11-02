import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsService } from '../user-components.service';
import { UserComponentAboutMeDto } from '../dto/user-component-about-me.dto';
import { UserComponentAboutMe } from '../entities/user-component-about-me.entity';
import { UpdateUserComponentAboutMeDto } from '../dto/update-user-component-about-me.dto';

@Injectable()
export class CreateOrUpdateAboutMeUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(userId: number, dto: UserComponentAboutMeDto): Promise<UserComponentAboutMe> {
        const user = await this.usersService.findById(userId);
        return await this.userComponentsService.createOrUpdateAboutMe(user, dto);
    }
};

@Injectable()
export class UpdateAboutMeUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(userId: number, dto: UpdateUserComponentAboutMeDto): Promise<UserComponentAboutMe> {
        return await this.userComponentsService.updateAboutMe(userId, dto);
    }
};

@Injectable()
export class GetAboutMeUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(userId: number): Promise<UserComponentAboutMe | null> {
        return await this.userComponentsService.getAboutMe(userId);
    }
};

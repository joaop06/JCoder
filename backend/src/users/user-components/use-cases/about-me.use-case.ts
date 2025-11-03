import { Injectable } from '@nestjs/common';
import { UserComponentsRepository } from '../repositories';
import { UserComponentAboutMe } from '../entities/user-component-about-me.entity';
import { UpdateUserComponentAboutMeDto } from '../dto/update-user-component-about-me.dto';

@Injectable()
export class GetAboutMeUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(username: string): Promise<UserComponentAboutMe | null> {
        return await this.userComponentsRepository.aboutMeRepository.findByUsername(username);
    }
};

@Injectable()
export class UpdateAboutMeUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(username: string, dto: UpdateUserComponentAboutMeDto): Promise<UserComponentAboutMe> {
        return await this.userComponentsRepository.aboutMeRepository.update(username, dto);
    }
};

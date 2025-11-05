import { Injectable } from '@nestjs/common';
import { UserComponentsRepository } from '../repositories';
import { UsersService } from '../../../users/users.service';
import { UserComponentExperience } from '../entities/user-component-experience.entity';
import { PaginatedResponseDto, PaginationDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentExperienceDto } from '../dto/create-user-component-experience.dto';
import { UpdateUserComponentExperienceDto } from '../dto/update-user-component-experience.dto';

@Injectable()
export class GetExperiencesUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentExperience>> {
        return await this.userComponentsRepository.experienceRepository.findAll(username, paginationDto);
    }
};

@Injectable()
export class CreateExperienceUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(username: string, dto: CreateUserComponentExperienceDto): Promise<UserComponentExperience> {
        const user = await this.usersService.findOneBy({ username });
        return await this.userComponentsRepository.experienceRepository.create(user, dto);
    }
};

@Injectable()
export class UpdateExperienceUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(id: number, dto: UpdateUserComponentExperienceDto): Promise<UserComponentExperience> {
        return await this.userComponentsRepository.experienceRepository.update(id, dto);
    }
};

@Injectable()
export class DeleteExperienceUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(id: number): Promise<void> {
        await this.userComponentsRepository.experienceRepository.delete(id);
    }
};

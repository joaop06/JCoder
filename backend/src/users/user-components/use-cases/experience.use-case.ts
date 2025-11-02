import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsService } from '../user-components.service';
import { UserComponentExperienceDto } from '../dto/user-component-experience.dto';
import { UserComponentExperience } from '../entities/user-component-experience.entity';
import { UpdateUserComponentExperienceDto } from '../dto/update-user-component-experience.dto';

@Injectable()
export class CreateExperienceUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(userId: number, dto: UserComponentExperienceDto): Promise<UserComponentExperience> {
        const user = await this.usersService.findById(userId);
        return await this.userComponentsService.createExperience(user, dto);
    }
};

@Injectable()
export class UpdateExperienceUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(id: number, dto: UpdateUserComponentExperienceDto): Promise<UserComponentExperience> {
        return await this.userComponentsService.updateExperience(id, dto);
    }
};

@Injectable()
export class GetExperienceUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(id: number): Promise<UserComponentExperience | null> {
        return await this.userComponentsService.getExperience(id);
    }
};

@Injectable()
export class GetExperiencesUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(userId: number): Promise<UserComponentExperience[]> {
        return await this.userComponentsService.getExperiences(userId);
    }
};

@Injectable()
export class DeleteExperienceUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(id: number): Promise<void> {
        await this.userComponentsService.deleteExperience(id);
    }
};

import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsService } from '../user-components.service';
import { UserComponentEducationDto } from '../dto/user-component-education.dto';
import { UserComponentEducation } from '../entities/user-component-education.entity';
import { UpdateUserComponentEducationDto } from '../dto/update-user-component-education.dto';

@Injectable()
export class CreateEducationUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(username: string, dto: UserComponentEducationDto): Promise<UserComponentEducation> {
        const user = await this.usersService.findByUsername(username);
        return await this.userComponentsService.createEducation(user, dto);
    }
};

@Injectable()
export class UpdateEducationUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(id: number, dto: UpdateUserComponentEducationDto): Promise<UserComponentEducation> {
        return await this.userComponentsService.updateEducation(id, dto);
    }
};

@Injectable()
export class GetEducationUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(id: number): Promise<UserComponentEducation | null> {
        return await this.userComponentsService.getEducation(id);
    }
};

@Injectable()
export class GetEducationsUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(username: string): Promise<UserComponentEducation[]> {
        const userId = await this.usersService.findUserIdByUsername(username);
        return await this.userComponentsService.getEducations(userId);
    }
};

@Injectable()
export class DeleteEducationUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(id: number): Promise<void> {
        await this.userComponentsService.deleteEducation(id);
    }
};

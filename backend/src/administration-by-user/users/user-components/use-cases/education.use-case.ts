import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsRepository } from '../repositories';
import { UserComponentEducationDto } from '../dto/user-component-education.dto';
import { UserComponentEducation } from '../entities/user-component-education.entity';
import { PaginatedResponseDto, PaginationDto } from '../../../../@common/dto/pagination.dto';
import { UpdateUserComponentEducationDto } from '../dto/update-user-component-education.dto';

@Injectable()
export class GetEducationsUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(
        username: string,
        paginationDto: PaginationDto,
    ): Promise<PaginatedResponseDto<UserComponentEducation>> {
        return await this.userComponentsRepository.educationRepository.findAll(username, paginationDto);
    }
};

@Injectable()
export class CreateEducationUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(username: string, dto: UserComponentEducationDto): Promise<UserComponentEducation> {
        const user = await this.usersService.findOneBy({ username });
        return await this.userComponentsRepository.educationRepository.create(user, dto);
    }
};

@Injectable()
export class UpdateEducationUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(id: number, dto: UpdateUserComponentEducationDto): Promise<UserComponentEducation> {
        return await this.userComponentsRepository.educationRepository.update(id, dto);
    }
};

@Injectable()
export class DeleteEducationUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(id: number): Promise<void> {
        await this.userComponentsRepository.educationRepository.delete(id);
    }
};

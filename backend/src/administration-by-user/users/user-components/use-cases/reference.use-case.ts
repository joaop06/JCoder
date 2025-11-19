import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsRepository } from '../repositories';
import { UserComponentReference } from '../entities/user-component-reference.entity';
import { PaginatedResponseDto, PaginationDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentReferenceDto } from '../dto/create-user-component-reference.dto';
import { UpdateUserComponentReferenceDto } from '../dto/update-user-component-reference.dto';

@Injectable()
export class GetReferencesUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentReference>> {
        return await this.userComponentsRepository.referenceRepository.findAll(username, paginationDto);
    }
};

@Injectable()
export class CreateReferenceUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(username: string, dto: CreateUserComponentReferenceDto): Promise<UserComponentReference> {
        const user = await this.usersService.findOneBy({ username });
        return await this.userComponentsRepository.referenceRepository.create(user, dto);
    }
};

@Injectable()
export class UpdateReferenceUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(id: number, dto: UpdateUserComponentReferenceDto): Promise<UserComponentReference> {
        return await this.userComponentsRepository.referenceRepository.update(id, dto);
    }
};

@Injectable()
export class DeleteReferenceUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(id: number): Promise<void> {
        await this.userComponentsRepository.referenceRepository.delete(id);
    }
};

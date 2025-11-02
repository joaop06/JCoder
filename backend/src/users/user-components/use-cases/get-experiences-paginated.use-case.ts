import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsService } from '../user-components.service';
import { UserComponentExperience } from '../entities/user-component-experience.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../@common/dto/pagination.dto';

@Injectable()
export class GetExperiencesPaginatedUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(username: string, pagination: PaginationDto): Promise<PaginatedResponseDto<UserComponentExperience>> {
        const userId = await this.usersService.findUserIdByUsername(username);
        return await this.userComponentsService.getExperiencesPaginated(userId, pagination);
    }
};

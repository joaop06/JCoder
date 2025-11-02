import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsService } from '../user-components.service';
import { UserComponentEducation } from '../entities/user-component-education.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../@common/dto/pagination.dto';

@Injectable()
export class GetEducationsPaginatedUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(username: string, pagination: PaginationDto): Promise<PaginatedResponseDto<UserComponentEducation>> {
        const userId = await this.usersService.findUserIdByUsername(username);
        return await this.userComponentsService.getEducationsPaginated(userId, pagination);
    }
};

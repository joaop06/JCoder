import { Injectable } from '@nestjs/common';
import { UserComponentsService } from '../user-components.service';
import { UserComponentExperience } from '../entities/user-component-experience.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../@common/dto/pagination.dto';

@Injectable()
export class GetExperiencesPaginatedUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(userId: number, pagination: PaginationDto): Promise<PaginatedResponseDto<UserComponentExperience>> {
        return await this.userComponentsService.getExperiencesPaginated(userId, pagination);
    }
};

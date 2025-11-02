import { Injectable } from '@nestjs/common';
import { UserComponentsService } from '../user-components.service';
import { UserComponentEducation } from '../entities/user-component-education.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../@common/dto/pagination.dto';

@Injectable()
export class GetEducationsPaginatedUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(userId: number, pagination: PaginationDto): Promise<PaginatedResponseDto<UserComponentEducation>> {
        return await this.userComponentsService.getEducationsPaginated(userId, pagination);
    }
};

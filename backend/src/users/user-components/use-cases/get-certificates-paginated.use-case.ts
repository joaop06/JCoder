import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsService } from '../user-components.service';
import { UserComponentCertificate } from '../entities/user-component-certificate.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../@common/dto/pagination.dto';

@Injectable()
export class GetCertificatesPaginatedUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(username: string, pagination: PaginationDto): Promise<PaginatedResponseDto<UserComponentCertificate>> {
        const userId = await this.usersService.findUserIdByUsername(username);
        return await this.userComponentsService.getCertificatesPaginated(userId, pagination);
    }
};

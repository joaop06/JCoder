import { Injectable } from '@nestjs/common';
import { UserComponentsService } from '../user-components.service';
import { UserComponentCertificate } from '../entities/user-component-certificate.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../@common/dto/pagination.dto';

@Injectable()
export class GetCertificatesPaginatedUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(userId: number, pagination: PaginationDto): Promise<PaginatedResponseDto<UserComponentCertificate>> {
        return await this.userComponentsService.getCertificatesPaginated(userId, pagination);
    }
};

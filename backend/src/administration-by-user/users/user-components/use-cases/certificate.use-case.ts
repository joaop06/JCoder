import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsRepository } from '../repositories';
import { UserComponentCertificate } from '../entities/user-component-certificate.entity';
import { PaginatedResponseDto, PaginationDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentCertificateDto } from '../dto/create-user-component-certificate.dto';
import { UpdateUserComponentCertificateDto } from '../dto/update-user-component-certificate.dto';

@Injectable()
export class GetCertificatesUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentCertificate>> {
        return await this.userComponentsRepository.certificateRepository.findAll(username, paginationDto);
    }
};

@Injectable()
export class CreateCertificateUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(username: string, dto: CreateUserComponentCertificateDto): Promise<UserComponentCertificate> {
        const user = await this.usersService.findOneBy({ username });
        return await this.userComponentsRepository.certificateRepository.create(user, dto);
    }
};

@Injectable()
export class UpdateCertificateUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(id: number, dto: UpdateUserComponentCertificateDto): Promise<UserComponentCertificate> {
        return await this.userComponentsRepository.certificateRepository.update(id, dto);
    }
};

@Injectable()
export class DeleteCertificateUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(id: number): Promise<void> {
        await this.userComponentsRepository.certificateRepository.delete(id);
    }
};

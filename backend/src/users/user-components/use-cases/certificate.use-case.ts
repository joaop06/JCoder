import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsService } from '../user-components.service';
import { UserComponentCertificateDto } from '../dto/user-component-certificate.dto';
import { UserComponentCertificate } from '../entities/user-component-certificate.entity';
import { UpdateUserComponentCertificateDto } from '../dto/update-user-component-certificate.dto';

@Injectable()
export class CreateCertificateUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(username: string, dto: UserComponentCertificateDto): Promise<UserComponentCertificate> {
        const user = await this.usersService.findByUsername(username);
        return await this.userComponentsService.createCertificate(user, dto);
    }
};

@Injectable()
export class UpdateCertificateUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(id: number, dto: UpdateUserComponentCertificateDto): Promise<UserComponentCertificate> {
        return await this.userComponentsService.updateCertificate(id, dto);
    }
};

@Injectable()
export class GetCertificateUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(id: number): Promise<UserComponentCertificate | null> {
        return await this.userComponentsService.getCertificate(id);
    }
};

@Injectable()
export class GetCertificatesUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(username: string): Promise<UserComponentCertificate[]> {
        const userId = await this.usersService.findUserIdByUsername(username);
        return await this.userComponentsService.getCertificates(userId);
    }
};

@Injectable()
export class DeleteCertificateUseCase {
    constructor(
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(id: number): Promise<void> {
        await this.userComponentsService.deleteCertificate(id);
    }
};

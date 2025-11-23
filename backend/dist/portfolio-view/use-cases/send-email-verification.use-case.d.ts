import { Repository } from 'typeorm';
import { EmailService } from '../../email/email.service';
import { EmailVerification } from '../entities/email-verification.entity';
import { SendEmailVerificationDto } from '../dto/send-email-verification.dto';
import { UsersService } from '../../administration-by-user/users/users.service';
export declare class SendEmailVerificationUseCase {
    private readonly emailVerificationRepository;
    private readonly emailService;
    private readonly usersService;
    constructor(emailVerificationRepository: Repository<EmailVerification>, emailService: EmailService, usersService: UsersService);
    execute(dto: SendEmailVerificationDto): Promise<{
        message: string;
    }>;
}

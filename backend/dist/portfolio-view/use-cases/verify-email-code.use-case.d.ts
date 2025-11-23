import { Repository } from 'typeorm';
import { VerifyEmailCodeDto } from '../dto/verify-email-code.dto';
import { EmailVerification } from '../entities/email-verification.entity';
export declare class VerifyEmailCodeUseCase {
    private readonly emailVerificationRepository;
    constructor(emailVerificationRepository: Repository<EmailVerification>);
    execute(dto: VerifyEmailCodeDto): Promise<{
        verified: boolean;
        message: string;
    }>;
}

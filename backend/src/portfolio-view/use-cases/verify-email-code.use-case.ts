import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { VerifyEmailCodeDto } from '../dto/verify-email-code.dto';
import { EmailVerification } from '../entities/email-verification.entity';

@Injectable()
export class VerifyEmailCodeUseCase {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
  ) { }

  async execute(dto: VerifyEmailCodeDto): Promise<{ verified: boolean; message: string }> {
    const { email, code } = dto;

    // Clear expired verifications
    await this.emailVerificationRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    // Find non-expired and unverified verification
    const verification = await this.emailVerificationRepository.findOne({
      where: {
        email,
        code,
        verified: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired code');
    }

    // Check if expired
    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Expired code. Request a new code.');
    }

    // Mark as verified
    verification.verified = true;
    await this.emailVerificationRepository.save(verification);

    return {
      verified: true,
      message: 'Email verified successfully',
    };
  }
}


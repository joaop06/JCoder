import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { EmailVerification } from '../entities/email-verification.entity';
import { VerifyEmailCodeDto } from '../dto/verify-email-code.dto';

@Injectable()
export class VerifyEmailCodeUseCase {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
  ) { }

  async execute(dto: VerifyEmailCodeDto): Promise<{ verified: boolean; message: string }> {
    const { email, code } = dto;

    // Limpar verificações expiradas
    await this.emailVerificationRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    // Buscar verificação não expirada e não verificada
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
      throw new BadRequestException('Código inválido ou expirado');
    }

    // Verificar se expirou
    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Código expirado. Solicite um novo código.');
    }

    // Marcar como verificado
    verification.verified = true;
    await this.emailVerificationRepository.save(verification);

    return {
      verified: true,
      message: 'Email verificado com sucesso',
    };
  }
}


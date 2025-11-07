import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from '../entities/email-verification.entity';
import { EmailService } from '../../email/email.service';
import { SendEmailVerificationDto } from '../dto/send-email-verification.dto';
import { EmailAlreadyExistsException } from '../../administration-by-user/users/exceptions/email-already-exists.exception';
import { UsersService } from '../../administration-by-user/users/users.service';

@Injectable()
export class SendEmailVerificationUseCase {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) { }

  async execute(dto: SendEmailVerificationDto): Promise<{ message: string }> {
    const { email } = dto;

    // Verificar se o email já está em uso
    const emailExists = await this.usersService.existsBy({ email });
    if (emailExists) {
      throw new EmailAlreadyExistsException();
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Definir expiração (15 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Remover verificações antigas não verificadas para este email
    await this.emailVerificationRepository.delete({
      email,
      verified: false,
    });

    // Criar nova verificação
    const verification = this.emailVerificationRepository.create({
      email,
      code,
      verified: false,
      expiresAt,
    });

    await this.emailVerificationRepository.save(verification);

    // Enviar email com o código
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4a90e2;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
          }
          .code-box {
            background-color: white;
            padding: 20px;
            text-align: center;
            border: 2px solid #4a90e2;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #4a90e2;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Verificação de E-mail - JCoder</h2>
        </div>
        <div class="content">
          <p>Olá,</p>
          <p>Use o código abaixo para verificar seu e-mail:</p>
          
          <div class="code-box">
            ${code}
          </div>
          
          <p>Este código expira em 15 minutos.</p>
          <p>Se você não solicitou este código, ignore este e-mail.</p>
        </div>
        <div class="footer">
          <p>Esta é uma notificação automática do sistema JCoder.</p>
          <p>Por favor, não responda este e-mail diretamente.</p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Verificação de E-mail - JCoder

      Olá,

      Use o código abaixo para verificar seu e-mail:

      ${code}

      Este código expira em 15 minutos.

      Se você não solicitou este código, ignore este e-mail.

      ---
      Esta é uma notificação automática do sistema JCoder.
      Por favor, não responda este e-mail diretamente.
    `;

    try {
      await this.emailService.sendEmail(
        email,
        'Verificação de E-mail - JCoder',
        htmlContent,
        textContent,
      );
    } catch (error) {
      // Se falhar ao enviar email, remover a verificação criada
      await this.emailVerificationRepository.delete({ id: verification.id });
      throw error;
    }

    return { message: 'Verification code sent successfully' };
  }
}


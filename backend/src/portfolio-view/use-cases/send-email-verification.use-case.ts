import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from '../../email/email.service';
import { EmailVerification } from '../entities/email-verification.entity';
import { SendEmailVerificationDto } from '../dto/send-email-verification.dto';
import { UsersService } from '../../administration-by-user/users/users.service';
import { EmailAlreadyExistsException } from '../../administration-by-user/users/exceptions/email-already-exists.exception';

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

    // Check if the email is already in use
    const emailExists = await this.usersService.existsBy({ email });
    if (emailExists) {
      throw new EmailAlreadyExistsException();
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Remove old unverified verifications for this email
    await this.emailVerificationRepository.delete({
      email,
      verified: false,
    });

    // Create new verification
    const verification = this.emailVerificationRepository.create({
      email,
      code,
      verified: false,
      expiresAt,
    });

    await this.emailVerificationRepository.save(verification);

    // Send email with the code
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
          <h2>Email Verification - JCoder</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Use the code below to verify your email:</p>
          
          <div class="code-box">
            ${code}
          </div>
          
          <p>This code expires in 15 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automatic notification from the JCoder system.</p>
          <p>Please do not reply to this email directly.</p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Email Verification - JCoder

      Hello,

      Use the code below to verify your email:

      ${code}

      This code expires in 15 minutes.

      If you did not request this code, please ignore this email.

      ---
      This is an automatic notification from the JCoder system.
      Please do not reply to this email directly.
    `;

    try {
      await this.emailService.sendEmail(
        email,
        'Email Verification - JCoder',
        htmlContent,
        textContent,
      );
    } catch (error) {
      // If email sending fails, remove the created verification
      await this.emailVerificationRepository.delete({ id: verification.id });
      throw error;
    }

    return { message: 'Verification code sent successfully' };
  }
}


import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from '../../email/email.service';
import { EmailVerification } from '../entities/email-verification.entity';
import { SendEmailVerificationDto } from '../dto/send-email-verification.dto';
import { UsersService } from '../../administration-by-user/users/users.service';
import { EmailAlreadyExistsException } from '../../administration-by-user/users/exceptions/email-already-exists.exception';
import { EmailTemplate } from '../../email/templates/email-template';

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

    // Send email with the code using the standardized template
    const codeBox = EmailTemplate.createCodeBox(code);
    const content = `
      <p style="margin: 0 0 20px 0;">Hello,</p>
      <p style="margin: 0 0 20px 0;">Use the code below to verify your email:</p>
      ${codeBox}
      <p style="margin: 20px 0 0 0;">This code expires in <strong>15 minutes</strong>.</p>
      <p style="margin: 15px 0 0 0; color: #a0a0a0;">If you did not request this code, please ignore this email.</p>
    `;

    const htmlContent = EmailTemplate.generateHTML({
      title: 'Email Verification',
      content,
    });

    const textContent = EmailTemplate.generateText(
      'Email Verification - JCoder',
      `Hello,\n\nUse the code below to verify your email:\n\n${code}\n\nThis code expires in 15 minutes.\n\nIf you did not request this code, please ignore this email.`,
    );

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


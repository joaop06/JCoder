import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages.service';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../../email/email.service';
import { CreateMessageDto } from '../dto/create-message.dto';
export declare class CreateMessageUseCase {
    private readonly emailService;
    private readonly usersService;
    private readonly configService;
    private readonly messagesService;
    constructor(emailService: EmailService, usersService: UsersService, configService: ConfigService, messagesService: MessagesService);
    execute(username: string, createMessageDto: CreateMessageDto): Promise<void>;
    private sendMessageNotificationEmail;
}

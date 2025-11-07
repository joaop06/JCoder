import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { UsersModule } from '../users/users.module';
import { MessagesService } from './messages.service';
import { EmailModule } from '../../email/email.module';
import { MessagesController } from './messages.controller';
import { OwnerGuard } from '../../@common/guards/owner.guard';
import { CreateMessageUseCase } from './use-cases/create-message.use-case';

@Module({
    imports: [
        EmailModule,
        UsersModule,
        ConfigModule,
        TypeOrmModule.forFeature([Message]),
    ],
    exports: [MessagesService, CreateMessageUseCase],
    controllers: [MessagesController],
    providers: [MessagesService, CreateMessageUseCase, OwnerGuard],
})
export class MessagesModule { };

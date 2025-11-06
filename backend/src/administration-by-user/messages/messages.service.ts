import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageNotFoundException } from './exceptions/message-not-found.exception';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private readonly repository: Repository<Message>,
        private readonly usersService: UsersService,
    ) { }

    async create(username: string, createMessageDto: CreateMessageDto): Promise<Message> {
        const user = await this.usersService.findOneBy({ username });

        if (!user) {
            throw new Error(`Usuário com username '${username}' não encontrado`);
        }

        const message = this.repository.create({
            ...createMessageDto,
            userId: user.id,
        });

        return await this.repository.save(message);
    }

    async findAll(username: string): Promise<Message[]> {
        return await this.repository.find({
            where: { user: { username } },
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: number, username: string): Promise<Message> {
        const message = await this.repository.findOne({
            where: { id, user: { username } },
            relations: ['user'],
        });

        if (!message) {
            throw new MessageNotFoundException();
        }

        return message;
    }

    async delete(id: number, username: string): Promise<void> {
        const message = await this.findById(id, username);
        await this.repository.softDelete(id);
    }
}


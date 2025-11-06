import {
    Get,
    Body,
    Post,
    Param,
    Delete,
    HttpCode,
    UseGuards,
    Controller,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { OwnerGuard } from '../../@common/guards/owner.guard';
import { JwtAuthGuard } from '../../@common/guards/jwt-auth.guard';
import { CreateMessageUseCase } from './use-cases/create-message.use-case';
import { MessageNotFoundException } from './exceptions/message-not-found.exception';
import { ApiTags, ApiOkResponse, ApiNoContentResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiExceptionResponse } from '../../@common/decorators/documentation/api-exception-response.decorator';

@Controller(':username/messages')
@ApiTags('Administration Messages')
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService,
        private readonly createMessageUseCase: CreateMessageUseCase,
    ) { }

    /**
     * Endpoint público para usuários comuns enviarem mensagens ao administrador
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 mensagens por minuto para prevenir spam
    @ApiOkResponse({ type: () => Message })
    async create(
        @Param('username') username: string,
        @Body() createMessageDto: CreateMessageDto,
    ): Promise<Message> {
        return await this.createMessageUseCase.execute(username, createMessageDto);
    }

    /**
     * Listar todas as mensagens recebidas (apenas para o administrador autenticado)
     */
    @Get()
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ isArray: true, type: () => Message })
    async findAll(@Param('username') username: string): Promise<Message[]> {
        return await this.messagesService.findAll(username);
    }

    /**
     * Buscar uma mensagem específica por ID (apenas para o administrador autenticado)
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ type: () => Message })
    @ApiExceptionResponse(() => MessageNotFoundException)
    async findById(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Message> {
        return await this.messagesService.findById(id, username);
    }

    /**
     * Deletar uma mensagem (soft delete) - apenas para o administrador autenticado
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @ApiBearerAuth()
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => MessageNotFoundException)
    async delete(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        return await this.messagesService.delete(id, username);
    }
};

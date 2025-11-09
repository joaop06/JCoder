import {
    Get,
    Param,
    Delete,
    HttpCode,
    UseGuards,
    Controller,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { OwnerGuard } from '../../@common/guards/owner.guard';
import { JwtAuthGuard } from '../../@common/guards/jwt-auth.guard';
import { MessageNotFoundException } from './exceptions/message-not-found.exception';
import { ApiTags, ApiOkResponse, ApiNoContentResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiExceptionResponse } from '../../@common/decorators/documentation/api-exception-response.decorator';

@Controller(':username/messages')
@ApiTags('Administration Messages')
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService,
    ) { }

    /**
     * List all received messages (only for authenticated administrator)
     */
    @Get()
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ isArray: true, type: () => Message })
    async findAll(@Param('username') username: string): Promise<Message[]> {
        return await this.messagesService.findAll(username);
    }

    /**
     * Find a specific message by ID (only for authenticated administrator)
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
     * Delete a message (soft delete) - only for authenticated administrator
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

import {
    Get,
    Post,
    Body,
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
import { ConversationNotFoundException } from './exceptions/conversation-not-found.exception';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MarkMessagesReadDto } from './dto/mark-messages-read.dto';
import { ApiTags, ApiOkResponse, ApiNoContentResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiExceptionResponse } from '../../@common/decorators/documentation/api-exception-response.decorator';

@Controller(':username/messages')
@ApiTags('Administration Messages')
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService,
    ) { }

    /**
     * List all conversations (grouped by sender) - only for authenticated administrator
     */
    @Get('conversations')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ isArray: true, type: () => ConversationResponseDto })
    async findAllConversations(@Param('username') username: string): Promise<ConversationResponseDto[]> {
        const conversations = await this.messagesService.findAllConversations(username);
        
        // Get last message preview for each conversation
        const conversationsWithPreview = await Promise.all(
            conversations.map(async (conversation) => {
                const preview = await this.messagesService.getLastMessagePreview(conversation.id);
                return ConversationResponseDto.fromEntity(conversation, preview);
            }),
        );

        return conversationsWithPreview;
    }

    /**
     * Get all messages from a specific conversation - only for authenticated administrator
     */
    @Get('conversations/:conversationId/messages')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ isArray: true, type: () => Message })
    @ApiExceptionResponse(() => ConversationNotFoundException)
    async findMessagesByConversation(
        @Param('username') username: string,
        @Param('conversationId', ParseIntPipe) conversationId: number,
    ): Promise<Message[]> {
        return await this.messagesService.findMessagesByConversation(conversationId, username);
    }

    /**
     * Mark messages as read in a conversation - only for authenticated administrator
     */
    @Post('conversations/:conversationId/mark-read')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @ApiBearerAuth()
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => ConversationNotFoundException)
    async markMessagesAsRead(
        @Param('username') username: string,
        @Param('conversationId', ParseIntPipe) conversationId: number,
        @Body() markMessagesReadDto: MarkMessagesReadDto,
    ): Promise<void> {
        return await this.messagesService.markMessagesAsRead(
            conversationId,
            username,
            markMessagesReadDto.messageIds,
        );
    }

    /**
     * List all received messages (legacy endpoint, kept for backward compatibility)
     * Only for authenticated administrator
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

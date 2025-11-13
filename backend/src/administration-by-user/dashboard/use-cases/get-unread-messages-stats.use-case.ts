import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { Message } from '../../messages/entities/message.entity';
import { Conversation } from '../../messages/entities/conversation.entity';
import { CacheService } from '../../../@common/services/cache.service';
import { UnreadMessagesDto } from '../dto/dashboard-response.dto';

@Injectable()
export class GetUnreadMessagesStatsUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async execute(username: string): Promise<UnreadMessagesDto> {
    const cacheKey = this.cacheService.generateKey('dashboard', 'unread-messages', username);

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.usersService.findOneBy({ username });

        if (!user) {
          return { total: 0, conversations: 0 };
        }

        // Optimized: Count unread messages and conversations in a single query
        // First get conversation IDs
        const conversations = await this.conversationRepository.find({
          where: { userId: user.id },
          select: ['id'],
        });

        if (conversations.length === 0) {
          return { total: 0, conversations: 0 };
        }

        const conversationIds = conversations.map((c) => c.id);

        // Count unread messages grouped by conversation
        const unreadCounts = await this.messageRepository
          .createQueryBuilder('message')
          .select('message.conversationId', 'conversationId')
          .addSelect('COUNT(message.id)', 'count')
          .where('message.conversationId IN (:...conversationIds)', {
            conversationIds,
          })
          .andWhere('message.readAt IS NULL')
          .andWhere('message.deletedAt IS NULL')
          .groupBy('message.conversationId')
          .getRawMany();

        // Calculate totals
        const total = unreadCounts.reduce(
          (sum, item: { conversationId: number; count: string }) =>
            sum + parseInt(item.count, 10),
          0,
        );
        const conversationsWithUnread = unreadCounts.length;

        return {
          total,
          conversations: conversationsWithUnread,
        };
      },
      60, // 1 minute cache (messages change frequently)
    );
  }
}


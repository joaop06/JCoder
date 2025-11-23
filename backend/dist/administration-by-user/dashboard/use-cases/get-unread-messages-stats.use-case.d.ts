import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { Message } from '../../messages/entities/message.entity';
import { Conversation } from '../../messages/entities/conversation.entity';
import { CacheService } from '../../../@common/services/cache.service';
import { UnreadMessagesDto } from '../dto/dashboard-response.dto';
export declare class GetUnreadMessagesStatsUseCase {
    private readonly usersService;
    private readonly cacheService;
    private readonly messageRepository;
    private readonly conversationRepository;
    constructor(usersService: UsersService, cacheService: CacheService, messageRepository: Repository<Message>, conversationRepository: Repository<Conversation>);
    execute(username: string): Promise<UnreadMessagesDto>;
}

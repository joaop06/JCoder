import { Request } from 'express';
import { Repository } from 'typeorm';
import { PortfolioView } from '../entities/portfolio-view.entity';
import { RegisterPortfolioViewDto } from '../dto/register-portfolio-view.dto';
import { User } from '../../administration-by-user/users/entities/user.entity';
export declare class RegisterPortfolioViewUseCase {
    private readonly portfolioViewRepository;
    private readonly userRepository;
    private readonly COOLDOWN_MINUTES;
    constructor(portfolioViewRepository: Repository<PortfolioView>, userRepository: Repository<User>);
    execute(username: string, dto: RegisterPortfolioViewDto, request: Request): Promise<void>;
    private getClientIp;
}

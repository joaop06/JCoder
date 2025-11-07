import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { CacheService } from '../../@common/services/cache.service';
import { GetApplicationDetailsDto } from '../dto/get-application-details.dto';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { Application } from '../../administration-by-user/applications/entities/application.entity';
import { UserNotFoundException } from '../../administration-by-user/users/exceptions/user-not-found.exception';
import { ApplicationNotFoundException } from '../../administration-by-user/applications/exceptions/application-not-found.exception';

@Injectable()
export class GetApplicationDetailsUseCase {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) { }

  /**
   * Busca detalhes de uma aplicação específica (com componentes)
   * Carregamento sob demanda quando o usuário clica em uma aplicação
   */
  async execute(id: number, username: string): Promise<GetApplicationDetailsDto> {
    const cacheKey = this.cacheService.generateKey('portfolio', 'application', id, username);

    const user = await this.userRepository.findOneBy({ username });
    if (!user) throw new UserNotFoundException();

    const application = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const application = await this.applicationRepository.findOne({
          where: { id, userId: user.id, isActive: true },
          relations: {
            technologies: true,
            applicationComponentApi: true,
            applicationComponentMobile: true,
            applicationComponentLibrary: true,
            applicationComponentFrontend: true,
          },
        });

        if (!application) throw new ApplicationNotFoundException();

        return application;
      },
      600, // 10 minutes cache
    );

    return plainToInstance(GetApplicationDetailsDto, application);
  }
};

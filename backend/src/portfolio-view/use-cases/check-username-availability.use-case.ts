import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { CheckUsernameAvailabilityDto } from '../dto/check-username-availability.dto';

@Injectable()
export class CheckUsernameAvailabilityUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /**
   * Verifica disponibilidade do username
   * Retorna true se o username estiver disponível (não existe)
   */
  async execute(username: string): Promise<CheckUsernameAvailabilityDto> {
    // Validação básica do formato do username
    if (!username || username.length < 3) {
      return plainToInstance(CheckUsernameAvailabilityDto, {
        available: false,
        username,
      });
    }

    // Verificar se o username já existe
    const userExists = await this.userRepository.findOneBy({ username });

    return plainToInstance(CheckUsernameAvailabilityDto, {
      available: !userExists,
      username,
    });
  }
};

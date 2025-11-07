import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { CheckEmailAvailabilityDto } from '../dto/check-email-availability.dto';

@Injectable()
export class CheckEmailAvailabilityUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /**
   * Verifica disponibilidade do email
   * Retorna true se o email estiver disponível (não existe)
   */
  async execute(email: string): Promise<CheckEmailAvailabilityDto> {
    // Validação básica do formato do email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return plainToInstance(CheckEmailAvailabilityDto, {
        available: false,
        email,
      });
    }

    // Verificar se o email já existe
    const userExists = await this.userRepository.findOneBy({ email });

    return plainToInstance(CheckEmailAvailabilityDto, {
      available: !userExists,
      email,
    });
  }
};


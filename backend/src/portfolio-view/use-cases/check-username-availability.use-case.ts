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
   * Checks username availability
   * Returns true if the username is available (does not exist)
   */
  async execute(username: string): Promise<CheckUsernameAvailabilityDto> {
    // Basic username format validation
    if (!username || username.length < 3) {
      return plainToInstance(CheckUsernameAvailabilityDto, {
        available: false,
        username,
      });
    }

    // Check if the username already exists
    const userExists = await this.userRepository.findOneBy({ username });

    return plainToInstance(CheckUsernameAvailabilityDto, {
      available: !userExists,
      username,
    });
  }
};

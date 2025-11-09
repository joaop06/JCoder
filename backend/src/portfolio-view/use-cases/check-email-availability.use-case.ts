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
   * Checks email availability
   * Returns true if the email is available (does not exist)
   */
  async execute(email: string): Promise<CheckEmailAvailabilityDto> {
    // Basic email format validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return plainToInstance(CheckEmailAvailabilityDto, {
        available: false,
        email,
      });
    }

    // Check if the email already exists
    const userExists = await this.userRepository.findOneBy({ email });

    return plainToInstance(CheckEmailAvailabilityDto, {
      available: !userExists,
      email,
    });
  }
};


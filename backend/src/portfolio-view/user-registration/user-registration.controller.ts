import {
  Post,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { UserRegistrationService } from './user-registration.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { ApiExceptionResponse } from '../../@common/decorators/documentation/api-exception-response.decorator';
import { EmailAlreadyExistsException } from '../../administration-by-user/users/exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from '../../administration-by-user/users/exceptions/username-already-exists.exception';

@ApiTags('User Registration')
@Controller('register')
export class UserRegistrationController {
  constructor(private readonly userRegistrationService: UserRegistrationService) { }

  /**
   * Cadastro de novo usuário administrador
   * Permite que novos usuários criem suas contas e comecem a gerenciar seus portfólios
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 tentativas por minuto para prevenir spam
  @ApiOkResponse({ type: () => User })
  @ApiExceptionResponse(() => [EmailAlreadyExistsException, UsernameAlreadyExistsException])
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userRegistrationService.createUser(createUserDto);
  }
};

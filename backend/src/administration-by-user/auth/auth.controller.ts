import {
  Body,
  Post,
  HttpCode,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SignInDto } from './dto/sign-in.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { SignInUseCase } from './use-cases/sign-in.use-case';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { PasswordDoesNotMatchException } from './exceptions/password-does-not-match.exception';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
  ) { }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOkResponse({ type: () => SignInResponseDto })
  @ApiExceptionResponse(() => PasswordDoesNotMatchException)
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return await this.signInUseCase.execute(signInDto);
  }
};

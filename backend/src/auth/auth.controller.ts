import { SignInDto } from './dto/sign-in.dto';
import { Controller, Post, Body } from '@nestjs/common';
import { SignInUseCase } from './use-cases/sign-in.use-case';
import { SignInResponseDto } from './dto/sign-in-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
  ) { }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return await this.signInUseCase.execute(signInDto);
  }
};

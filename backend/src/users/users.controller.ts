import {
    Get,
    Body,
    Patch,
    HttpCode,
    UseGuards,
    Controller,
    HttpStatus,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { ApiOkResponse } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../@common/guards/jwt-auth.guard';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { CurrentUser } from '../@common/decorators/current-user/current-user.decorator';
import { EmailAlreadyExistsException } from './exceptions/email-already-exists.exception';
import { InvalidCurrentPasswordException } from './exceptions/invalid-current-password.exception';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';

@Controller('users')
export class UsersController {
    constructor(
        private readonly getProfileUseCase: GetProfileUseCase,
        private readonly updateProfileUseCase: UpdateProfileUseCase,
    ) { }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: () => User })
    @ApiExceptionResponse(() => UserNotFoundException)
    async getProfile(@CurrentUser() user: User): Promise<User> {
        return await this.getProfileUseCase.execute(user.id);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: () => User })
    @ApiExceptionResponse(() => UserNotFoundException)
    @ApiExceptionResponse(() => InvalidCurrentPasswordException)
    @ApiExceptionResponse(() => EmailAlreadyExistsException)
    async updateProfile(
        @CurrentUser() user: User,
        @Body() updateProfileDto: UpdateProfileDto,
    ): Promise<User> {
        return await this.updateProfileUseCase.execute(user.id, updateProfileDto);
    }
};


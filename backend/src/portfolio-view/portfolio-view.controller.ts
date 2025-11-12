import {
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  Controller,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateUserDto } from './dto/create-user.dto';
import { GetEducationsDto } from './dto/get-educations.dto';
import { PaginationDto } from '../@common/dto/pagination.dto';
import { GetExperiencesDto } from './dto/get-experiences.dto';
import { GetApplicationsDto } from './dto/get-applications.dto';
import { GetCertificatesDto } from './dto/get-certificates.dto';
import { GetReferencesDto } from './dto/get-references.dto';
import { GetTechnologiesDto } from './dto/get-technologies.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetEducationsUseCase } from './use-cases/get-educations.use-case';
import { User } from '../administration-by-user/users/entities/user.entity';
import { GetApplicationDetailsDto } from './dto/get-application-details.dto';
import { GetExperiencesUseCase } from './use-cases/get-experiences.use-case';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import { ApiTags, ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { CheckEmailAvailabilityDto } from './dto/check-email-availability.dto';
import { GetApplicationsUseCase } from './use-cases/get-applications.use-case';
import { GetCertificatesUseCase } from './use-cases/get-certificates.use-case';
import { GetReferencesUseCase } from './use-cases/get-references.use-case';
import { GetProfileWithAboutMeDto } from './dto/get-profile-with-about-me.dto';
import { GetTechnologiesUseCase } from './use-cases/get-technologies.use-case';
import { VerifyEmailCodeUseCase } from './use-cases/verify-email-code.use-case';
import { CheckUsernameAvailabilityDto } from './dto/check-username-availability.dto';
import { GetApplicationDetailsUseCase } from './use-cases/get-application-details.use-case';
import { SendEmailVerificationUseCase } from './use-cases/send-email-verification.use-case';
import { CreateMessageDto } from '../administration-by-user/messages/dto/create-message.dto';
import { CheckEmailAvailabilityUseCase } from './use-cases/check-email-availability.use-case';
import { GetProfileWithAboutMeUseCase } from './use-cases/get-profile-with-about-me.use-case';
import { CheckUsernameAvailabilityUseCase } from './use-cases/check-username-availability.use-case';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';
import { CreateMessageUseCase } from '../administration-by-user/messages/use-cases/create-message.use-case';
import { UserNotFoundException } from '../administration-by-user/users/exceptions/user-not-found.exception';
import { EmailAlreadyExistsException } from '../administration-by-user/users/exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from '../administration-by-user/users/exceptions/username-already-exists.exception';
import { TechnologyNotFoundException } from '../administration-by-user/technologies/exceptions/technology-not-found.exception';
import { ApplicationNotFoundException } from '../administration-by-user/applications/exceptions/application-not-found.exception';

@ApiTags('Portfolio View')
@Controller('portfolio')
export class PortfolioViewController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getEducationsUseCase: GetEducationsUseCase,
    private readonly getExperiencesUseCase: GetExperiencesUseCase,
    private readonly getApplicationsUseCase: GetApplicationsUseCase,
    private readonly getCertificatesUseCase: GetCertificatesUseCase,
    private readonly getReferencesUseCase: GetReferencesUseCase,
    private readonly getTechnologiesUseCase: GetTechnologiesUseCase,
    private readonly getApplicationDetailsUseCase: GetApplicationDetailsUseCase,
    private readonly getProfileWithAboutMeUseCase: GetProfileWithAboutMeUseCase,
    private readonly checkUsernameAvailabilityUseCase: CheckUsernameAvailabilityUseCase,
    private readonly checkEmailAvailabilityUseCase: CheckEmailAvailabilityUseCase,
    private readonly sendEmailVerificationUseCase: SendEmailVerificationUseCase,
    private readonly verifyEmailCodeUseCase: VerifyEmailCodeUseCase,
  ) { }

  /**
   * Checks username availability
   * Used for real-time validation during registration
   * Must be before dynamic :username routes to avoid conflicts
   */
  @Get('check-username/:username')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => CheckUsernameAvailabilityDto })
  async checkUsernameAvailability(
    @Param('username') username: string,
  ): Promise<CheckUsernameAvailabilityDto> {
    return await this.checkUsernameAvailabilityUseCase.execute(username);
  }

  /**
   * Checks email availability
   * Used for real-time validation during registration
   */
  @Get('check-email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => CheckEmailAvailabilityDto })
  async checkEmailAvailability(
    @Param('email') email: string,
  ): Promise<CheckEmailAvailabilityDto> {
    return await this.checkEmailAvailabilityUseCase.execute(email);
  }

  /**
   * Sends verification code to email
   * Used during registration process
   */
  @Post('send-email-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @ApiOkResponse({ schema: { type: 'object', properties: { message: { type: 'string' } } } })
  @ApiExceptionResponse(() => EmailAlreadyExistsException)
  async sendEmailVerification(
    @Body() dto: SendEmailVerificationDto,
  ): Promise<{ message: string }> {
    return await this.sendEmailVerificationUseCase.execute(dto);
  }

  /**
   * Verifies email verification code
   * Used during registration process
   */
  @Post('verify-email-code')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOkResponse({ schema: { type: 'object', properties: { verified: { type: 'boolean' }, message: { type: 'string' } } } })
  async verifyEmailCode(
    @Body() dto: VerifyEmailCodeDto,
  ): Promise<{ verified: boolean; message: string }> {
    return await this.verifyEmailCodeUseCase.execute(dto);
  }

  /**
   * New administrator user registration
   * Allows new users to create their accounts and start managing their portfolios
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 attempts per minute to prevent spam
  @ApiOkResponse({ type: () => User })
  @ApiExceptionResponse(() => [EmailAlreadyExistsException, UsernameAlreadyExistsException])
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.createUserUseCase.execute(createUserDto);
  }

  /**
   * Public endpoint for regular users to send messages to the administrator
   */
  @Post(':username/messages')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 messages per minute to prevent spam
  @ApiNoContentResponse()
  async createMessage(
    @Param('username') username: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<void> {
    return await this.createMessageUseCase.execute(username, createMessageDto);
  }

  /**
   * Fetches basic profile data with About Me
   * Optimized route for initial portfolio loading
   */
  @Get(':username/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => GetProfileWithAboutMeDto })
  @ApiExceptionResponse(() => UserNotFoundException)
  async getProfileWithAboutMe(
    @Param('username') username: string,
  ): Promise<GetProfileWithAboutMeDto> {
    return await this.getProfileWithAboutMeUseCase.execute(username);
  }

  /**
   * Fetches user educations
   * On-demand loading for better mobile performance
   */
  @Get(':username/educations')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => GetEducationsDto })
  @ApiExceptionResponse(() => UserNotFoundException)
  async getEducations(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<GetEducationsDto> {
    return await this.getEducationsUseCase.execute(username, paginationDto);
  }

  /**
   * Fetches user experiences
   */
  @Get(':username/experiences')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => GetExperiencesDto })
  @ApiExceptionResponse(() => UserNotFoundException)
  async getExperiences(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<GetExperiencesDto> {
    return await this.getExperiencesUseCase.execute(username, paginationDto);
  }

  /**
   * Fetches user certificates
   */
  @Get(':username/certificates')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => GetCertificatesDto })
  @ApiExceptionResponse(() => UserNotFoundException)
  async getCertificates(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<GetCertificatesDto> {
    return await this.getCertificatesUseCase.execute(username, paginationDto);
  }

  /**
   * Fetches all user applications (without components)
   * Optimized listing for performance
   */
  @Get(':username/applications')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => GetApplicationsDto })
  @ApiExceptionResponse(() => UserNotFoundException)
  async getApplications(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<GetApplicationsDto> {
    return await this.getApplicationsUseCase.execute(username, paginationDto);
  }

  /**
   * Fetches details of a specific application (with components)
   * On-demand loading when user clicks on an application
   */
  @Get(':username/applications/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => GetApplicationDetailsDto })
  @ApiExceptionResponse(() => [UserNotFoundException, ApplicationNotFoundException])
  async getApplicationDetails(
    @Param('username') username: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetApplicationDetailsDto> {
    return await this.getApplicationDetailsUseCase.execute(id, username);
  }

  /**
   * Fetches user references
   */
  @Get(':username/references')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => GetReferencesDto })
  @ApiExceptionResponse(() => UserNotFoundException)
  async getReferences(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<GetReferencesDto> {
    return await this.getReferencesUseCase.execute(username, paginationDto);
  }

  /**
   * Fetches user technologies
   */
  @Get(':username/technologies')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => GetTechnologiesDto })
  @ApiExceptionResponse(() => [UserNotFoundException, TechnologyNotFoundException])
  async getTechnologies(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<GetTechnologiesDto> {
    return await this.getTechnologiesUseCase.execute(username, paginationDto);
  }
};

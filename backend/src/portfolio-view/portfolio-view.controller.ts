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
import { PaginationDto } from '../@common/dto/pagination.dto';
import { GetEducationsDto } from './dto/get-educations.dto';
import { GetExperiencesDto } from './dto/get-experiences.dto';
import { GetCertificatesDto } from './dto/get-certificates.dto';
import { GetApplicationsDto } from './dto/get-applications.dto';
import { GetTechnologiesDto } from './dto/get-technologies.dto';
import { GetEducationsUseCase } from './use-cases/get-educations.use-case';
import { GetApplicationDetailsDto } from './dto/get-application-details.dto';
import { GetExperiencesUseCase } from './use-cases/get-experiences.use-case';
import { ApiTags, ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { GetApplicationsUseCase } from './use-cases/get-applications.use-case';
import { GetCertificatesUseCase } from './use-cases/get-certificates.use-case';
import { GetTechnologiesUseCase } from './use-cases/get-technologies.use-case';
import { GetProfileWithAboutMeDto } from './dto/get-profile-with-about-me.dto';
import { CheckUsernameAvailabilityDto } from './dto/check-username-availability.dto';
import { GetApplicationDetailsUseCase } from './use-cases/get-application-details.use-case';
import { CreateMessageDto } from '../administration-by-user/messages/dto/create-message.dto';
import { GetProfileWithAboutMeUseCase } from './use-cases/get-profile-with-about-me.use-case';
import { CheckUsernameAvailabilityUseCase } from './use-cases/check-username-availability.use-case';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';
import { UserNotFoundException } from '../administration-by-user/users/exceptions/user-not-found.exception';
import { CreateMessageUseCase } from '../administration-by-user/messages/use-cases/create-message.use-case';
import { TechnologyNotFoundException } from '../administration-by-user/technologies/exceptions/technology-not-found.exception';
import { ApplicationNotFoundException } from '../administration-by-user/applications/exceptions/application-not-found.exception';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../administration-by-user/users/entities/user.entity';
import { EmailAlreadyExistsException } from '../administration-by-user/users/exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from '../administration-by-user/users/exceptions/username-already-exists.exception';

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
    private readonly getTechnologiesUseCase: GetTechnologiesUseCase,
    private readonly getApplicationDetailsUseCase: GetApplicationDetailsUseCase,
    private readonly getProfileWithAboutMeUseCase: GetProfileWithAboutMeUseCase,
    private readonly checkUsernameAvailabilityUseCase: CheckUsernameAvailabilityUseCase,
  ) { }

  /**
   * Verifica disponibilidade do username
   * Usado para validação em tempo real durante o cadastro
   * Deve estar antes das rotas dinâmicas :username para evitar conflitos
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
   * Cadastro de novo usuário administrador
   * Permite que novos usuários criem suas contas e comecem a gerenciar seus portfólios
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 tentativas por minuto para prevenir spam
  @ApiOkResponse({ type: () => User })
  @ApiExceptionResponse(() => [EmailAlreadyExistsException, UsernameAlreadyExistsException])
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.createUserUseCase.execute(createUserDto);
  }

  /**
   * Endpoint público para usuários comuns enviarem mensagens ao administrador
   */
  @Post(':username/messages')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 mensagens por minuto para prevenir spam
  @ApiNoContentResponse()
  async createMessage(
    @Param('username') username: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<void> {
    return await this.createMessageUseCase.execute(username, createMessageDto);
  }

  /**
   * Busca dados básicos do perfil com About Me
   * Rota otimizada para carregamento inicial do portfólio
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
   * Busca educações do usuário
   * Carregamento sob demanda para melhor performance mobile
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
   * Busca experiências do usuário
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
   * Busca certificados do usuário
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
   * Busca todas as aplicações do usuário (sem componentes)
   * Listagem otimizada para performance
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
   * Busca detalhes de uma aplicação específica (com componentes)
   * Carregamento sob demanda quando usuário clica em uma aplicação
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
   * Busca tecnologias do usuário
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

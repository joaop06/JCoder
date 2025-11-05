import {
  Get,
  Param,
  Query,
  HttpCode,
  Controller,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { PortfolioViewService } from './portfolio-view.service';
import { User } from '../administration-by-user/users/entities/user.entity';
import { PaginationDto, PaginatedResponseDto } from '../@common/dto/pagination.dto';
import { Technology } from '../administration-by-user/technologies/entities/technology.entity';
import { Application } from '../administration-by-user/applications/entities/application.entity';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';
import { UserNotFoundException } from '../administration-by-user/users/exceptions/user-not-found.exception';
import { TechnologyNotFoundException } from '../administration-by-user/technologies/exceptions/technology-not-found.exception';
import { UserComponentAboutMe } from '../administration-by-user/users/user-components/entities/user-component-about-me.entity';
import { ApplicationNotFoundException } from '../administration-by-user/applications/exceptions/application-not-found.exception';
import { UserComponentEducation } from '../administration-by-user/users/user-components/entities/user-component-education.entity';
import { UserComponentExperience } from '../administration-by-user/users/user-components/entities/user-component-experience.entity';
import { UserComponentCertificate } from '../administration-by-user/users/user-components/entities/user-component-certificate.entity';

@ApiTags('Portfolio View')
@Controller('portfolio')
export class PortfolioViewController {
  constructor(
    private readonly portfolioViewService: PortfolioViewService,
  ) { }

  /**
   * Verifica disponibilidade do username
   * Usado para validação em tempo real durante o cadastro
   * Deve estar antes das rotas dinâmicas :username para evitar conflitos
   */
  @Get('check-username/:username')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ 
    schema: { 
      type: 'object', 
      properties: { 
        available: { type: 'boolean' },
        username: { type: 'string' }
      } 
    } 
  })
  async checkUsernameAvailability(
    @Param('username') username: string,
  ): Promise<{ available: boolean; username: string }> {
    return await this.portfolioViewService.checkUsernameAvailability(username);
  }

  /**
   * Busca dados básicos do perfil com About Me
   * Rota otimizada para carregamento inicial do portfólio
   */
  @Get(':username/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => User })
  @ApiExceptionResponse(() => UserNotFoundException)
  async getProfileWithAboutMe(
    @Param('username') username: string,
  ): Promise<User & { aboutMe?: UserComponentAboutMe }> {
    return await this.portfolioViewService.getProfileWithAboutMe(username);
  }

  /**
   * Busca educações do usuário
   * Carregamento sob demanda para melhor performance mobile
   */
  @Get(':username/educations')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => PaginatedResponseDto<UserComponentEducation> })
  @ApiExceptionResponse(() => UserNotFoundException)
  async getEducations(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UserComponentEducation>> {
    return await this.portfolioViewService.getEducations(username, paginationDto);
  }

  /**
   * Busca experiências do usuário
   */
  @Get(':username/experiences')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => PaginatedResponseDto<UserComponentExperience> })
  @ApiExceptionResponse(() => UserNotFoundException)
  async getExperiences(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UserComponentExperience>> {
    return await this.portfolioViewService.getExperiences(username, paginationDto);
  }

  /**
   * Busca certificados do usuário
   */
  @Get(':username/certificates')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => PaginatedResponseDto<UserComponentCertificate> })
  @ApiExceptionResponse(() => UserNotFoundException)
  async getCertificates(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UserComponentCertificate>> {
    return await this.portfolioViewService.getCertificates(username, paginationDto);
  }

  /**
   * Busca todas as aplicações do usuário (sem componentes)
   * Listagem otimizada para performance
   */
  @Get(':username/applications')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => PaginatedResponseDto<Application> })
  @ApiExceptionResponse(() => UserNotFoundException)
  async getApplications(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Application>> {
    return await this.portfolioViewService.getApplications(username, paginationDto);
  }

  /**
   * Busca detalhes de uma aplicação específica (com componentes)
   * Carregamento sob demanda quando usuário clica em uma aplicação
   */
  @Get(':username/applications/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => Application })
  @ApiExceptionResponse(() => [UserNotFoundException, ApplicationNotFoundException])
  async getApplicationDetails(
    @Param('username') username: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Application> {
    return await this.portfolioViewService.getApplicationDetails(id, username);
  }

  /**
   * Busca tecnologias do usuário
   */
  @Get(':username/technologies')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: () => PaginatedResponseDto<Technology> })
  @ApiExceptionResponse(() => [UserNotFoundException, TechnologyNotFoundException])
  async getTechnologies(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Technology>> {
    return await this.portfolioViewService.getTechnologies(username, paginationDto);
  }
};

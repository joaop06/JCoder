import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from '../@common/services/cache.service';
import { User } from '../administration-by-user/users/entities/user.entity';
import { PaginationDto, PaginatedResponseDto } from '../@common/dto/pagination.dto';
import { Technology } from '../administration-by-user/technologies/entities/technology.entity';
import { Application } from '../administration-by-user/applications/entities/application.entity';
import { UserNotFoundException } from '../administration-by-user/users/exceptions/user-not-found.exception';
import { UserComponentAboutMe } from '../administration-by-user/users/user-components/entities/user-component-about-me.entity';
import { UserComponentEducation } from '../administration-by-user/users/user-components/entities/user-component-education.entity';
import { UserComponentExperience } from '../administration-by-user/users/user-components/entities/user-component-experience.entity';
import { UserComponentCertificate } from '../administration-by-user/users/user-components/entities/user-component-certificate.entity';
import { ApplicationNotFoundException } from '../administration-by-user/applications/exceptions/application-not-found.exception';

@Injectable()
export class PortfolioViewService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,

    @InjectRepository(Technology)
    private readonly technologyRepository: Repository<Technology>,

    @InjectRepository(UserComponentAboutMe)
    private readonly aboutMeRepository: Repository<UserComponentAboutMe>,

    @InjectRepository(UserComponentEducation)
    private readonly educationRepository: Repository<UserComponentEducation>,

    @InjectRepository(UserComponentExperience)
    private readonly experienceRepository: Repository<UserComponentExperience>,

    @InjectRepository(UserComponentCertificate)
    private readonly certificateRepository: Repository<UserComponentCertificate>,

    private readonly cacheService: CacheService,
  ) { }

  /**
   * Busca dados básicos do perfil do usuário com About Me
   * Otimizado para mobile - apenas dados essenciais sempre visíveis
   */
  async getProfileWithAboutMe(username: string): Promise<User & { aboutMe?: UserComponentAboutMe }> {
    const cacheKey = this.cacheService.generateKey('portfolio', 'profile', username);

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.userRepository.findOne({
          where: { username },
          relations: ['userComponentAboutMe', 'userComponentAboutMe.highlights'],
          select: ['id', 'username', 'firstName', 'fullName', 'email', 'githubUrl', 'linkedinUrl', 'profileImage', 'createdAt', 'updatedAt'],
        });

        if (!user) throw new UserNotFoundException();

        return user;
      },
      600, // 10 minutes cache
    );
  }

  /**
   * Busca educações do usuário
   * Rotas separadas para carregamento sob demanda (lazy loading)
   */
  async getEducations(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UserComponentEducation>> {
    const { page = 1, limit = 10, sortBy = 'startDate', sortOrder = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    const cacheKey = this.cacheService.generateKey(
      'portfolio',
      'educations',
      username,
      page,
      limit,
      sortBy,
      sortOrder,
    );

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Verificar se usuário existe
        const userExists = await this.userRepository.findOneBy({ username });
        if (!userExists) throw new UserNotFoundException();

        const [data, total] = await this.educationRepository.findAndCount({
          where: { username },
          relations: ['certificates'],
          skip,
          take: limit,
          order: { [sortBy]: sortOrder },
        });

        const totalPages = Math.ceil(total / limit);

        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      },
      300, // 5 minutes cache
    );
  }

  /**
   * Busca experiências do usuário
   */
  async getExperiences(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UserComponentExperience>> {
    const { page = 1, limit = 10, sortBy = 'startDate', sortOrder = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    const cacheKey = this.cacheService.generateKey(
      'portfolio',
      'experiences',
      username,
      page,
      limit,
      sortBy,
      sortOrder,
    );

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const userExists = await this.userRepository.findOneBy({ username });
        if (!userExists) throw new UserNotFoundException();

        const [data, total] = await this.experienceRepository.findAndCount({
          where: { username },
          relations: ['positions'],
          skip,
          take: limit,
          order: { [sortBy]: sortOrder },
        });

        const totalPages = Math.ceil(total / limit);

        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      },
      300, // 5 minutes cache
    );
  }

  /**
   * Busca certificados do usuário
   */
  async getCertificates(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UserComponentCertificate>> {
    const { page = 1, limit = 10, sortBy = 'issueDate', sortOrder = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    const cacheKey = this.cacheService.generateKey(
      'portfolio',
      'certificates',
      username,
      page,
      limit,
      sortBy,
      sortOrder,
    );

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const userExists = await this.userRepository.findOneBy({ username });
        if (!userExists) throw new UserNotFoundException();

        const [data, total] = await this.certificateRepository.findAndCount({
          where: { username },
          relations: ['educations'],
          skip,
          take: limit,
          order: { [sortBy]: sortOrder },
        });

        const totalPages = Math.ceil(total / limit);

        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      },
      300, // 5 minutes cache
    );
  }

  /**
   * Busca todas as aplicações do usuário (sem componentes)
   * Otimizado para listagem rápida
   */
  async getApplications(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Application>> {
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const cacheKey = this.cacheService.generateKey(
      'portfolio',
      'applications',
      username,
      page,
      limit,
      sortBy,
      sortOrder,
    );

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const userExists = await this.userRepository.findOneBy({ username });
        if (!userExists) throw new UserNotFoundException();

        const [data, total] = await this.applicationRepository.findAndCount({
          where: { username, isActive: true },
          relations: ['technologies'],
          skip,
          take: limit,
          order: { [sortBy]: sortOrder },
        });

        const totalPages = Math.ceil(total / limit);

        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      },
      300, // 5 minutes cache
    );
  }

  /**
   * Busca detalhes de uma aplicação específica (com componentes)
   * Carregamento sob demanda quando o usuário clica em uma aplicação
   */
  async getApplicationDetails(id: number, username: string): Promise<Application> {
    const cacheKey = this.cacheService.generateKey('portfolio', 'application', id, username);

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const application = await this.applicationRepository.findOne({
          where: { id, username, isActive: true },
          relations: {
            technologies: true,
            applicationComponentApi: true,
            applicationComponentMobile: true,
            applicationComponentLibrary: true,
            applicationComponentFrontend: true,
          },
        });

        if (!application) throw new ApplicationNotFoundException();

        return application;
      },
      600, // 10 minutes cache
    );
  }

  /**
   * Busca tecnologias do usuário
   */
  async getTechnologies(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Technology>> {
    const { page = 1, limit = 50, sortBy = 'displayOrder', sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const cacheKey = this.cacheService.generateKey(
      'portfolio',
      'technologies',
      username,
      page,
      limit,
      sortBy,
      sortOrder,
    );

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const userExists = await this.userRepository.findOneBy({ username });
        if (!userExists) throw new UserNotFoundException();

        const [data, total] = await this.technologyRepository.findAndCount({
          where: { username, isActive: true },
          skip,
          take: limit,
          order: { [sortBy]: sortOrder },
        });

        const totalPages = Math.ceil(total / limit);

        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      },
      300, // 5 minutes cache
    );
  }
}


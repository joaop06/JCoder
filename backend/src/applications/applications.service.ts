
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { CacheService } from '../@common/services/cache.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { ImageUploadService } from '../images/services/image-upload.service';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { PaginationDto, PaginatedResponseDto } from '../@common/dto/pagination.dto';
import { ApplicationNotFoundException } from './exceptions/application-not-found.exception';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly repository: Repository<Application>,
    private readonly cacheService: CacheService,
    private readonly imageUploadService: ImageUploadService,
  ) { }

  async findAll(options?: FindManyOptions<Application>): Promise<Application[]> {
    return await this.repository.find(options);
  }

  async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Application>> {
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const cacheKey = this.cacheService.generateKey('applications', 'paginated', page, limit, sortBy, sortOrder);

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const [data, total] = await this.repository.findAndCount({
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

  async findAllByQuery(queryDto: QueryApplicationDto): Promise<PaginatedResponseDto<Application>> {
    const {
      page = 1,
      isActive,
      limit = 10,
      sortOrder = 'ASC',
      sortBy = 'displayOrder',
    } = queryDto;
    const skip = (page - 1) * limit;

    const cacheKey = this.cacheService.generateKey(
      'applications',
      'query',
      page,
      limit,
      sortBy,
      sortOrder,
      isActive !== undefined ? String(isActive) : undefined,
    );

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const where: FindOptionsWhere<Application> = {};
        if (isActive !== undefined) where.isActive = isActive;

        const [data, total] = await this.repository.findAndCount({
          where,
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

  async findById(id: number): Promise<Application> {
    const cacheKey = this.cacheService.applicationKey(id, 'full');

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const application = await this.repository.findOne({
          where: { id },
          relations: {
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

  async findOneBy(options?: FindOptionsWhere<Application>): Promise<Application | null> {
    return await this.repository.findOneBy(options || {});
  }

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    const application = this.repository.create(createApplicationDto);
    const savedApplication = await this.repository.save(application);

    // Invalidate cache
    await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));
    await this.cacheService.del(this.cacheService.generateKey('applications', 'query'));

    return savedApplication;
  }

  async update(id: number, updateApplicationDto: UpdateApplicationDto & { displayOrder?: number }): Promise<Application> {
    const application = await this.findById(id);
    this.repository.merge(application, updateApplicationDto);
    const updatedApplication = await this.repository.save(application);

    // Invalidate cache
    await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
    await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));
    await this.cacheService.del(this.cacheService.generateKey('applications', 'query'));

    return updatedApplication;
  }

  async delete(id: number): Promise<void> {
    // Get application to access images before deletion
    const application = await this.findById(id);

    // Delete all associated images
    if (application.images && application.images.length > 0) {
      await this.imageUploadService.deleteAllApplicationImages(id);
    }

    await this.repository.delete(id);

    // Invalidate cache
    await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
    await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));
    await this.cacheService.del(this.cacheService.generateKey('applications', 'query'));
  }

  /**
   * Increments displayOrder of all applications that have displayOrder >= startPosition
   * Used when inserting a new application at a specific position
   */
  async incrementDisplayOrderFrom(startPosition: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Application)
      .set({ displayOrder: () => 'displayOrder + 1' })
      .where('displayOrder >= :startPosition', { startPosition })
      .execute();
  }

  /**
   * Reorders applications when an application's displayOrder is updated
   * @param id - ID of the application being updated
   * @param oldPosition - Current displayOrder position
   * @param newPosition - New displayOrder position
   */
  async reorderOnUpdate(
    id: number,
    oldPosition: number,
    newPosition: number,
  ): Promise<void> {
    if (oldPosition === newPosition) {
      return; // No reordering needed
    }

    if (newPosition < oldPosition) {
      // Moving up: increment displayOrder of applications between new and old position
      await this.repository
        .createQueryBuilder()
        .update(Application)
        .set({ displayOrder: () => 'displayOrder + 1' })
        .where('displayOrder >= :newPosition', { newPosition })
        .andWhere('displayOrder < :oldPosition', { oldPosition })
        .andWhere('id != :id', { id })
        .execute();
    } else {
      // Moving down: decrement displayOrder of applications between old and new position
      await this.repository
        .createQueryBuilder()
        .update(Application)
        .set({ displayOrder: () => 'displayOrder - 1' })
        .where('displayOrder > :oldPosition', { oldPosition })
        .andWhere('displayOrder <= :newPosition', { newPosition })
        .andWhere('id != :id', { id })
        .execute();
    }
  }

  /**
   * Decrements displayOrder of all applications that have displayOrder > deletedPosition
   * Used when deleting an application to adjust the order of remaining applications
   * @param deletedPosition - The displayOrder of the deleted application
   */
  async decrementDisplayOrderAfter(deletedPosition: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Application)
      .set({ displayOrder: () => 'displayOrder - 1' })
      .where('displayOrder > :deletedPosition', { deletedPosition })
      .execute();
  }
};

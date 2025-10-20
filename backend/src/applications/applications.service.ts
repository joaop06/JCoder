
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { CacheService } from '../@common/services/cache.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
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
    return await this.repository.find({
      ...options,
      relations: { user: true },
    });
  }

  async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Application>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    const cacheKey = this.cacheService.generateKey('applications', 'paginated', page, limit, sortBy, sortOrder);

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const [data, total] = await this.repository.findAndCount({
          relations: { user: true },
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
            user: true,
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

    return savedApplication;
  }

  async update(id: number, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
    const application = await this.findById(id);
    this.repository.merge(application, updateApplicationDto);
    const updatedApplication = await this.repository.save(application);

    // Invalidate cache
    await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
    await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));

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
  }

};

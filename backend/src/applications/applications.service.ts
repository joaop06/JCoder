
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationNotFoundException } from './exceptions/application-not-found.exception';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly repository: Repository<Application>,
  ) { }

  async findAll(options?: FindManyOptions<Application>): Promise<Application[]> {
    return await this.repository.find({
      ...options,
      relations: { user: true },
    });
  }

  async findById(id: number): Promise<Application> {
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
  }

  async existsApplicationName(name: string): Promise<boolean> {
    return await this.repository.existsBy({ name });
  }

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    const application = this.repository.create(createApplicationDto);
    return await this.repository.save(application);
  }

  async update(id: number, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
    const application = await this.findById(id);
    this.repository.merge(application, updateApplicationDto);
    return await this.repository.save(application);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
};

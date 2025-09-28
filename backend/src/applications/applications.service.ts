import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../applications/entities/application.entity';
import { CreateApplicationDto } from '../applications/dto/create-application.dto';
import { UpdateApplicationDto } from '../applications/dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    const application = this.applicationsRepository.create(createApplicationDto);
    return this.applicationsRepository.save(application);
  }

  async findAll(): Promise<Application[]> {
    return this.applicationsRepository.find();
  }

  async findOne(id: number): Promise<Application> {
    const application = await this.applicationsRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException(`Application with ID "${id}" not found`);
    }
    return application;
  }

  async update(id: number, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
    const application = await this.findOne(id);
    this.applicationsRepository.merge(application, updateApplicationDto);
    return this.applicationsRepository.save(application);
  }

  async remove(id: number): Promise<void> {
    const result = await this.applicationsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Application with ID "${id}" not found`);
    }
  }
}


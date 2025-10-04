import {
  Put,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { RoleEnum } from '../@common/enums/role.enum';
import { RolesGuard } from '../@common/guards/roles.guard';
import { Application } from './entities/application.entity';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../@common/guards/jwt-auth.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Roles } from '../@common/decorators/roles/roles.decorator';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ParseQuery } from '../@common/decorators/query/parse-query.decorator';
import { CreateApplicationUseCase } from './use-cases/create-application.use-case';
import { DeleteApplicationUseCase } from './use-cases/delete-application.use-case';
import { UpdateApplicationUseCase } from './use-cases/update-application.use-case';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly createApplicationUseCase: CreateApplicationUseCase,
    private readonly deleteApplicationUseCase: DeleteApplicationUseCase,
    private readonly updateApplicationUseCase: UpdateApplicationUseCase,
  ) { }

  @Get()
  async findAll(@ParseQuery() options: FindManyOptions<Application>) {
    return await this.applicationsService.findAll(options);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Application> {
    return await this.applicationsService.findById(+id);
  }

  @Post()
  @Roles(RoleEnum.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    return await this.createApplicationUseCase.execute(createApplicationDto);
  }

  @Put(':id')
  @Roles(RoleEnum.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    return await this.updateApplicationUseCase.execute(+id, updateApplicationDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return await this.deleteApplicationUseCase.execute(+id);
  }
};

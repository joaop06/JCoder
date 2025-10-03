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
import { RoleEnum } from '../@common/enums/role.enum';
import { RolesGuard } from '../@common/guards/roles.guard';
import { Application } from './entities/application.entity';
import { ApplicationsService } from './applications.service';
import { Roles } from '../@common/decorators/roles.decorator';
import { JwtAuthGuard } from '../@common/guards/jwt-auth.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
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
  async findAll() {
    return this.applicationsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Application> {
    return this.applicationsService.findById(+id);
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
    return this.updateApplicationUseCase.execute(+id, updateApplicationDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return this.deleteApplicationUseCase.execute(+id);
  }
};

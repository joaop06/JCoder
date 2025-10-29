import {
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  ParseIntPipe,
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
import { QueryApplicationDto } from './dto/query-application.dto';
import { ReorderApplicationDto } from './dto/reorder-application.dto';
import { ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';
import { ParseQuery } from '../@common/decorators/query/parse-query.decorator';
import { CreateApplicationUseCase } from './use-cases/create-application.use-case';
import { DeleteApplicationUseCase } from './use-cases/delete-application.use-case';
import { UpdateApplicationUseCase } from './use-cases/update-application.use-case';
import { ReorderApplicationUseCase } from './use-cases/reorder-application.use-case';
import { PaginationDto, PaginatedResponseDto } from '../@common/dto/pagination.dto';
import { ApplicationNotFoundException } from './exceptions/application-not-found.exception';
import { RequiredApiComponentToApiApplication } from './exceptions/required-api-component.exception';
import { AlreadyExistsApplicationException } from './exceptions/already-exists-application-exception';
import { AlreadyDeletedApplicationException } from './exceptions/already-deleted-application.exception';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';
import { RequiredMobileComponentToMobileApplication } from './exceptions/required-mobile-component.exception';
import { RequiredFrontendComponentToApiApplication } from './exceptions/required-frontend-component.exception';
import { RequiredLibraryComponentToLibraryApplication } from './exceptions/required-library-component.exception';
import { RequiredApiAndFrontendComponentsToFullstackApplication } from './exceptions/required-api-and-frontend-components.exception';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly createApplicationUseCase: CreateApplicationUseCase,
    private readonly deleteApplicationUseCase: DeleteApplicationUseCase,
    private readonly updateApplicationUseCase: UpdateApplicationUseCase,
    private readonly reorderApplicationUseCase: ReorderApplicationUseCase,
  ) { }

  @Get()
  @ApiOkResponse({ type: () => Application, isArray: true })
  async findAll(@ParseQuery() options: FindManyOptions<Application>) {
    return await this.applicationsService.findAll(options);
  }

  @Get('paginated')
  @ApiOkResponse({ type: () => PaginatedResponseDto<Application> })
  async findAllPaginated(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<Application>> {
    return await this.applicationsService.findAllPaginated(paginationDto);
  }

  @Get('query')
  @ApiOkResponse({ type: () => PaginatedResponseDto<Application> })
  async findAllByQuery(
    @Query() queryDto: QueryApplicationDto,
  ): Promise<PaginatedResponseDto<Application>> {
    return await this.applicationsService.findAllByQuery(queryDto);
  }

  @Get('stats')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        active: { type: 'number' },
        inactive: { type: 'number' },
        total: { type: 'number' },
      },
    },
  })
  async getStats(): Promise<{ active: number; inactive: number; total: number }> {
    return await this.applicationsService.getStats();
  }

  @Get(':id')
  @ApiOkResponse({ type: () => Application })
  @ApiExceptionResponse(() => ApplicationNotFoundException)
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Application> {
    return await this.applicationsService.findById(id);
  }

  @Post()
  @Roles(RoleEnum.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: () => Application })
  @ApiExceptionResponse(() => [
    ApplicationNotFoundException,
    AlreadyExistsApplicationException,
    RequiredApiComponentToApiApplication,
    RequiredFrontendComponentToApiApplication,
    RequiredMobileComponentToMobileApplication,
    RequiredLibraryComponentToLibraryApplication,
    RequiredApiAndFrontendComponentsToFullstackApplication,
  ])
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    return await this.createApplicationUseCase.execute(createApplicationDto);
  }

  @Put(':id')
  @Roles(RoleEnum.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: () => Application })
  @ApiExceptionResponse(() => [
    ApplicationNotFoundException,
    AlreadyExistsApplicationException,
  ])
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    return await this.updateApplicationUseCase.execute(+id, updateApplicationDto);
  }

  @Put(':id/reorder')
  @Roles(RoleEnum.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: () => Application })
  @ApiExceptionResponse(() => [ApplicationNotFoundException])
  async reorder(
    @Param('id', ParseIntPipe) id: number,
    @Body() reorderApplicationDto: ReorderApplicationDto,
  ): Promise<Application> {
    return await this.reorderApplicationUseCase.execute(id, reorderApplicationDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiNoContentResponse()
  @ApiExceptionResponse(() => AlreadyDeletedApplicationException)
  async delete(@Param('id') id: string) {
    return await this.deleteApplicationUseCase.execute(+id);
  }

};

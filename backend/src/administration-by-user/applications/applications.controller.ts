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
import { Application } from './entities/application.entity';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../../@common/guards/jwt-auth.guard';
import { ApplicationsStatsDto } from './dto/applications-stats.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ReorderApplicationDto } from './dto/reorder-application.dto';
import { CreateApplicationUseCase } from './use-cases/create-application.use-case';
import { DeleteApplicationUseCase } from './use-cases/delete-application.use-case';
import { UpdateApplicationUseCase } from './use-cases/update-application.use-case';
import { ReorderApplicationUseCase } from './use-cases/reorder-application.use-case';
import { PaginationDto, PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { ApplicationNotFoundException } from './exceptions/application-not-found.exception';
import { ApiNoContentResponse, ApiOkResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequiredApiComponentToApiApplication } from './exceptions/required-api-component.exception';
import { AlreadyExistsApplicationException } from './exceptions/already-exists-application-exception';
import { AlreadyDeletedApplicationException } from './exceptions/already-deleted-application.exception';
import { RequiredMobileComponentToMobileApplication } from './exceptions/required-mobile-component.exception';
import { ApiExceptionResponse } from '../../@common/decorators/documentation/api-exception-response.decorator';
import { RequiredFrontendComponentToApiApplication } from './exceptions/required-frontend-component.exception';
import { RequiredLibraryComponentToLibraryApplication } from './exceptions/required-library-component.exception';
import { RequiredApiAndFrontendComponentsToFullstackApplication } from './exceptions/required-api-and-frontend-components.exception';

@ApiBearerAuth()
@Controller(':username/applications')
@ApiTags('Administration Applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly createApplicationUseCase: CreateApplicationUseCase,
    private readonly deleteApplicationUseCase: DeleteApplicationUseCase,
    private readonly updateApplicationUseCase: UpdateApplicationUseCase,
    private readonly reorderApplicationUseCase: ReorderApplicationUseCase,
  ) { }

  @Get()
  @ApiOkResponse({ type: () => PaginatedResponseDto<Application> })
  async findAll(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Application>> {
    return await this.applicationsService.findAll(username, paginationDto);
  }

  @Get('stats')
  @ApiOkResponse({ type: () => ApplicationsStatsDto })
  async getStats(
    @Param('username') username: string,
  ): Promise<ApplicationsStatsDto> {
    return await this.applicationsService.getStats(username);
  }

  @Get(':id')
  @ApiOkResponse({ type: () => Application })
  @ApiExceptionResponse(() => ApplicationNotFoundException)
  async findById(
    @Param('username') username: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Application> {
    return await this.applicationsService.findById(id, username);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
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
    @Param('username') username: string,
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    return await this.createApplicationUseCase.execute(username, createApplicationDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => Application })
  @ApiExceptionResponse(() => [
    ApplicationNotFoundException,
    AlreadyExistsApplicationException,
  ])
  async update(
    @Param('username') username: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    return await this.updateApplicationUseCase.execute(username, +id, updateApplicationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @ApiExceptionResponse(() => AlreadyDeletedApplicationException)
  async delete(
    @Param('username') username: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.deleteApplicationUseCase.execute(username, +id);
  }

  @Put(':id/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => Application })
  @ApiExceptionResponse(() => [ApplicationNotFoundException])
  async reorder(
    @Param('username') username: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() reorderApplicationDto: ReorderApplicationDto,
  ): Promise<Application> {
    return await this.reorderApplicationUseCase.execute(username, id, reorderApplicationDto);
  }
};

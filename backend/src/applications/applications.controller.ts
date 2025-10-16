import {
  Get,
  Put,
  Res,
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
  UploadedFiles,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import * as fs from 'fs';
import { Response } from 'express';
import { FindManyOptions } from 'typeorm';
import { RoleEnum } from '../@common/enums/role.enum';
import { RolesGuard } from '../@common/guards/roles.guard';
import { Application } from './entities/application.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../@common/guards/jwt-auth.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Roles } from '../@common/decorators/roles/roles.decorator';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';
import { ParseQuery } from '../@common/decorators/query/parse-query.decorator';
import { CreateApplicationUseCase } from './use-cases/create-application.use-case';
import { DeleteApplicationUseCase } from './use-cases/delete-application.use-case';
import { UpdateApplicationUseCase } from './use-cases/update-application.use-case';
import { PaginationDto, PaginatedResponseDto } from '../@common/dto/pagination.dto';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';
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
    UserNotFoundException,
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

  @Delete(':id')
  @Roles(RoleEnum.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiNoContentResponse()
  @ApiExceptionResponse(() => AlreadyDeletedApplicationException)
  async delete(@Param('id') id: string) {
    return await this.deleteApplicationUseCase.execute(+id);
  }

  @Post(':id/images')
  @Roles(RoleEnum.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('images', 10, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
      }
    },
  }))
  @ApiOkResponse({ type: () => Application })
  @ApiExceptionResponse(() => ApplicationNotFoundException)
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Application> {
    return await this.applicationsService.uploadImages(id, files);
  }

  @Get(':id/images/:filename')
  @ApiOkResponse({ description: 'Image file' })
  @ApiExceptionResponse(() => ApplicationNotFoundException)
  async getImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const imagePath = await this.applicationsService.getImagePath(id, filename);
    const file = fs.createReadStream(imagePath);

    // Set appropriate content type based on file extension
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType = ext === 'png' ? 'image/png' :
      ext === 'webp' ? 'image/webp' : 'image/jpeg';

    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
    });

    return new StreamableFile(file);
  }

  @Delete(':id/images/:filename')
  @Roles(RoleEnum.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiExceptionResponse(() => ApplicationNotFoundException)
  async deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('filename') filename: string,
  ): Promise<void> {
    await this.applicationsService.deleteImage(id, filename);
  }
};

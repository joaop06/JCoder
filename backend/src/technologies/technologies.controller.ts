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
    UseInterceptors,
} from '@nestjs/common';
import * as fs from 'fs';
import { Response } from 'express';
import { FindManyOptions } from 'typeorm';
import { RoleEnum } from '../@common/enums/role.enum';
import { RolesGuard } from '../@common/guards/roles.guard';
import { Technology } from './entities/technology.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { TechnologiesService } from './technologies.service';
import { JwtAuthGuard } from '../@common/guards/jwt-auth.guard';
import { Roles } from '../@common/decorators/roles/roles.decorator';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { QueryTechnologyDto } from './dto/query-technology.dto';
import { ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';
import { ParseQuery } from '../@common/decorators/query/parse-query.decorator';
import { CreateTechnologyUseCase } from './use-cases/create-technology.use-case';
import { DeleteTechnologyUseCase } from './use-cases/delete-technology.use-case';
import { UpdateTechnologyUseCase } from './use-cases/update-technology.use-case';
import { PaginationDto, PaginatedResponseDto } from '../@common/dto/pagination.dto';
import { TechnologyNotFoundException } from './exceptions/technology-not-found.exception';
import { TechnologyAlreadyExistsException } from './exceptions/technology-already-exists.exception';
import { TechnologyAlreadyDeletedException } from './exceptions/technology-already-deleted.exception';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';
import { UploadTechnologyProfileImageUseCase } from './use-cases/upload-technology-profile-image.use-case';
import { DeleteTechnologyProfileImageUseCase } from './use-cases/delete-technology-profile-image.use-case';

@Controller('technologies')
export class TechnologiesController {
    constructor(
        private readonly technologiesService: TechnologiesService,
        private readonly createTechnologyUseCase: CreateTechnologyUseCase,
        private readonly updateTechnologyUseCase: UpdateTechnologyUseCase,
        private readonly deleteTechnologyUseCase: DeleteTechnologyUseCase,
        private readonly uploadTechnologyProfileImageUseCase: UploadTechnologyProfileImageUseCase,
        private readonly deleteTechnologyProfileImageUseCase: DeleteTechnologyProfileImageUseCase,
    ) { }

    @Get()
    @ApiOkResponse({ type: () => Technology, isArray: true })
    async findAll(@ParseQuery() options: FindManyOptions<Technology>) {
        return await this.technologiesService.findAll(options);
    }

    @Get('paginated')
    @ApiOkResponse({ type: () => PaginatedResponseDto<Technology> })
    async findAllPaginated(
        @Query() paginationDto: PaginationDto,
    ): Promise<PaginatedResponseDto<Technology>> {
        return await this.technologiesService.findAllPaginated(paginationDto);
    }

    @Get('query')
    @ApiOkResponse({ type: () => PaginatedResponseDto<Technology> })
    async findAllByQuery(
        @Query() queryDto: QueryTechnologyDto,
    ): Promise<PaginatedResponseDto<Technology>> {
        return await this.technologiesService.findAllByQuery(queryDto);
    }

    @Get(':id')
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => TechnologyNotFoundException)
    async findById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Technology> {
        return await this.technologiesService.findById(id);
    }

    @Post()
    @Roles(RoleEnum.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => [
        TechnologyNotFoundException,
        TechnologyAlreadyExistsException,
    ])
    async create(
        @Body() createTechnologyDto: CreateTechnologyDto,
    ): Promise<Technology> {
        return await this.createTechnologyUseCase.execute(createTechnologyDto);
    }

    @Put(':id')
    @Roles(RoleEnum.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => [
        TechnologyNotFoundException,
        TechnologyAlreadyExistsException,
    ])
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTechnologyDto: UpdateTechnologyDto,
    ): Promise<Technology> {
        return await this.updateTechnologyUseCase.execute(id, updateTechnologyDto);
    }

    @Delete(':id')
    @Roles(RoleEnum.Admin)
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => [
        TechnologyNotFoundException,
        TechnologyAlreadyDeletedException,
    ])
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return await this.deleteTechnologyUseCase.execute(id);
    }

    @Post(':id/profile-image')
    @Roles(RoleEnum.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(
        FilesInterceptor('profileImage', 1, {
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
            fileFilter: (req, file, cb) => {
                const allowedMimes = [
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/webp',
                    'image/svg+xml',
                ];
                if (allowedMimes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(
                        new Error(
                            'Invalid file type. Only JPEG, PNG, WebP and SVG images are allowed.',
                        ),
                        false,
                    );
                }
            },
        }),
    )
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => TechnologyNotFoundException)
    async uploadProfileImage(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() files: Express.Multer.File[],
    ): Promise<Technology> {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.uploadTechnologyProfileImageUseCase.execute(
            id,
            files[0],
        );
    }

    @Get(':id/profile-image')
    @ApiOkResponse({ description: 'Technology profile image file' })
    @ApiExceptionResponse(() => TechnologyNotFoundException)
    async getProfileImage(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ): Promise<void> {
        const technology = await this.technologiesService.findById(id);

        if (!technology.profileImage) {
            throw new Error('Technology has no profile image');
        }

        const imagePath = `uploads/technologies/${technology.profileImage}`;

        // Set headers
        res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000', // 1 year cache
        });

        // Stream the file directly
        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }

    @Delete(':id/profile-image')
    @Roles(RoleEnum.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => TechnologyNotFoundException)
    async deleteProfileImage(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.deleteTechnologyProfileImageUseCase.execute(id);
    }
}


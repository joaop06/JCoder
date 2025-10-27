import {
    Get,
    Put,
    Res,
    Post,
    Param,
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
import { RoleEnum } from '../@common/enums/role.enum';
import { RolesGuard } from '../@common/guards/roles.guard';
import { Application } from '../applications/entities/application.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../@common/guards/jwt-auth.guard';
import { Roles } from '../@common/decorators/roles/roles.decorator';
import { ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';
import { UploadImagesUseCase } from './use-cases/upload-images.use-case';
import { DeleteImageUseCase } from './use-cases/delete-image.use-case';
import { GetImageUseCase } from './use-cases/get-image.use-case';
import { UploadProfileImageUseCase } from './use-cases/upload-profile-image.use-case';
import { UpdateProfileImageUseCase } from './use-cases/update-profile-image.use-case';
import { DeleteProfileImageUseCase } from './use-cases/delete-profile-image.use-case';
import { GetProfileImageUseCase } from './use-cases/get-profile-image.use-case';
import { ApplicationNotFoundException } from '../applications/exceptions/application-not-found.exception';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';
import { Technology } from '../technologies/entities/technology.entity';
import { TechnologyNotFoundException } from '../technologies/exceptions/technology-not-found.exception';
import { UploadTechnologyProfileImageUseCase } from '../technologies/use-cases/upload-technology-profile-image.use-case';
import { DeleteTechnologyProfileImageUseCase } from '../technologies/use-cases/delete-technology-profile-image.use-case';
import { GetTechnologyProfileImageUseCase } from '../technologies/use-cases/get-technology-profile-image.use-case';

@Controller('images')
export class ImagesController {
    constructor(
        private readonly imagesService: ImagesService,
        private readonly uploadImagesUseCase: UploadImagesUseCase,
        private readonly deleteImageUseCase: DeleteImageUseCase,
        private readonly getImageUseCase: GetImageUseCase,
        private readonly uploadProfileImageUseCase: UploadProfileImageUseCase,
        private readonly updateProfileImageUseCase: UpdateProfileImageUseCase,
        private readonly deleteProfileImageUseCase: DeleteProfileImageUseCase,
        private readonly getProfileImageUseCase: GetProfileImageUseCase,
        private readonly uploadTechnologyProfileImageUseCase: UploadTechnologyProfileImageUseCase,
        private readonly deleteTechnologyProfileImageUseCase: DeleteTechnologyProfileImageUseCase,
        private readonly getTechnologyProfileImageUseCase: GetTechnologyProfileImageUseCase,
    ) { }

    @Post('applications/:id/images')
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
        return await this.uploadImagesUseCase.execute(id, files);
    }

    @Get('applications/:id/images/:filename')
    @ApiOkResponse({ description: 'Image file' })
    @ApiExceptionResponse(() => ApplicationNotFoundException)
    async getImage(
        @Param('id', ParseIntPipe) id: number,
        @Param('filename') filename: string,
        @Res() res: Response,
    ): Promise<void> {
        const imagePath = await this.getImageUseCase.execute(id, filename);

        // Set headers
        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000', // 1 year cache
        });

        // Stream the file directly
        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }

    @Delete('applications/:id/images/:filename')
    @Roles(RoleEnum.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => ApplicationNotFoundException)
    async deleteImage(
        @Param('id', ParseIntPipe) id: number,
        @Param('filename') filename: string,
    ): Promise<void> {
        await this.deleteImageUseCase.execute(id, filename);
    }

    @Post('applications/:id/profile-image')
    @Roles(RoleEnum.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FilesInterceptor('profileImage', 1, {
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
    async uploadProfileImage(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() files: Express.Multer.File[],
    ): Promise<Application> {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.uploadProfileImageUseCase.execute(id, files[0]);
    }

    @Put('applications/:id/profile-image')
    @Roles(RoleEnum.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FilesInterceptor('profileImage', 1, {
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
    async updateProfileImage(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() files: Express.Multer.File[],
    ): Promise<Application> {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.updateProfileImageUseCase.execute(id, files[0]);
    }

    @Get('applications/:id/profile-image')
    @ApiOkResponse({ description: 'Profile image file' })
    @ApiExceptionResponse(() => ApplicationNotFoundException)
    async getProfileImage(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ): Promise<void> {
        const imagePath = await this.getProfileImageUseCase.execute(id);

        // Set headers
        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000', // 1 year cache
        });

        // Stream the file directly
        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }

    @Delete('applications/:id/profile-image')
    @Roles(RoleEnum.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => ApplicationNotFoundException)
    async deleteProfileImage(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.deleteProfileImageUseCase.execute(id);
    }

    // ==================== TECHNOLOGIES ENDPOINTS ====================

    @Post('technologies/:id/profile-image')
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
    async uploadTechnologyProfileImage(
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

    @Get('technologies/:id/profile-image')
    @ApiOkResponse({ description: 'Technology profile image file' })
    @ApiExceptionResponse(() => TechnologyNotFoundException)
    async getTechnologyProfileImage(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ): Promise<void> {
        const imagePath = await this.getTechnologyProfileImageUseCase.execute(id);

        // Set headers
        res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000', // 1 year cache
        });

        // Stream the file directly
        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }

    @Delete('technologies/:id/profile-image')
    @Roles(RoleEnum.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => TechnologyNotFoundException)
    async deleteTechnologyProfileImage(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.deleteTechnologyProfileImageUseCase.execute(id);
    }
};

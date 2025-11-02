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
import { Application } from '../applications/entities/application.entity';
import { Technology } from '../technologies/entities/technology.entity';
import { User } from '../users/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../@common/guards/jwt-auth.guard';
import { CurrentUser } from '../@common/decorators/current-user/current-user.decorator';
import { ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';
import { ApplicationNotFoundException } from '../applications/exceptions/application-not-found.exception';
import { TechnologyNotFoundException } from '../technologies/exceptions/technology-not-found.exception';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';

// Application use cases
import { UploadImagesUseCase } from './use-cases/upload-images.use-case';
import { DeleteImageUseCase } from './use-cases/delete-image.use-case';
import { GetImageUseCase } from './use-cases/get-image.use-case';
import { UploadProfileImageUseCase } from './use-cases/upload-profile-image.use-case';
import { UpdateProfileImageUseCase } from './use-cases/update-profile-image.use-case';
import { DeleteProfileImageUseCase } from './use-cases/delete-profile-image.use-case';
import { GetProfileImageUseCase } from './use-cases/get-profile-image.use-case';

// Technology use cases
import { UploadTechnologyProfileImageUseCase } from './use-cases/upload-technology-profile-image.use-case';
import { DeleteTechnologyProfileImageUseCase } from './use-cases/delete-technology-profile-image.use-case';
import { GetTechnologyProfileImageUseCase } from './use-cases/get-technology-profile-image.use-case';

// User use cases
import { UploadUserProfileImageUseCase } from './use-cases/upload-user-profile-image.use-case';
import { DeleteUserProfileImageUseCase } from './use-cases/delete-user-profile-image.use-case';
import { GetUserProfileImageUseCase } from './use-cases/get-user-profile-image.use-case';

// Certificate use cases
import { UploadCertificateImageUseCase } from './use-cases/upload-certificate-image.use-case';
import { DeleteCertificateImageUseCase } from './use-cases/delete-certificate-image.use-case';
import { GetCertificateImageUseCase } from './use-cases/get-certificate-image.use-case';

@Controller('images')
export class ImagesController {
    constructor(
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
        private readonly uploadUserProfileImageUseCase: UploadUserProfileImageUseCase,
        private readonly deleteUserProfileImageUseCase: DeleteUserProfileImageUseCase,
        private readonly getUserProfileImageUseCase: GetUserProfileImageUseCase,
        private readonly uploadCertificateImageUseCase: UploadCertificateImageUseCase,
        private readonly deleteCertificateImageUseCase: DeleteCertificateImageUseCase,
        private readonly getCertificateImageUseCase: GetCertificateImageUseCase,
    ) { }

    // ==================== APPLICATION ENDPOINTS ====================

    @Post('applications/:id/images')
    @UseGuards(JwtAuthGuard)
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

        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
        });

        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }

    @Delete('applications/:id/images/:filename')
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('profileImage', 1, {
        limits: {
            fileSize: 5 * 1024 * 1024,
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
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('profileImage', 1, {
        limits: {
            fileSize: 5 * 1024 * 1024,
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

        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
        });

        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }

    @Delete('applications/:id/profile-image')
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('profileImage', 1, {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only JPEG, PNG, WebP and SVG images are allowed.'), false);
            }
        },
    }))
    @ApiOkResponse({ type: () => Technology })
    @ApiExceptionResponse(() => TechnologyNotFoundException)
    async uploadTechnologyProfileImage(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() files: Express.Multer.File[],
    ): Promise<Technology> {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.uploadTechnologyProfileImageUseCase.execute(id, files[0]);
    }

    @Get('technologies/:id/profile-image')
    @ApiOkResponse({ description: 'Technology profile image file' })
    @ApiExceptionResponse(() => TechnologyNotFoundException)
    async getTechnologyProfileImage(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ): Promise<void> {
        const imagePath = await this.getTechnologyProfileImageUseCase.execute(id);

        res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000',
        });

        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }

    @Delete('technologies/:id/profile-image')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => TechnologyNotFoundException)
    async deleteTechnologyProfileImage(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.deleteTechnologyProfileImageUseCase.execute(id);
    }

    // ==================== USER ENDPOINTS ====================

    @Post('users/profile-image')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FilesInterceptor('profileImage', 1, {
        limits: {
            fileSize: 5 * 1024 * 1024,
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
    @ApiOkResponse({ type: () => User })
    @ApiExceptionResponse(() => UserNotFoundException)
    async uploadUserProfileImage(
        @CurrentUser() user: User,
        @UploadedFiles() files: Express.Multer.File[],
    ): Promise<User> {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.uploadUserProfileImageUseCase.execute(user.id, files[0]);
    }

    @Get('users/:id/profile-image')
    @ApiOkResponse({ description: 'User profile image file' })
    @ApiExceptionResponse(() => UserNotFoundException)
    async getUserProfileImage(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ): Promise<void> {
        const imagePath = await this.getUserProfileImageUseCase.execute(id);

        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
        });

        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }

    @Delete('users/profile-image')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => UserNotFoundException)
    async deleteUserProfileImage(
        @CurrentUser() user: User,
    ): Promise<void> {
        await this.deleteUserProfileImageUseCase.execute(user.id);
    }

    // ==================== USER CERTIFICATES ENDPOINTS ====================

    @Post('users/certificates/:certificateId/image')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FilesInterceptor('certificateImage', 1, {
        limits: {
            fileSize: 5 * 1024 * 1024,
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
    @ApiOkResponse({ description: 'Certificate with uploaded image' })
    @ApiExceptionResponse(() => UserNotFoundException)
    async uploadCertificateImage(
        @CurrentUser() user: User,
        @Param('certificateId', ParseIntPipe) certificateId: number,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.uploadCertificateImageUseCase.execute(user.id, certificateId, files[0]);
    }

    @Get('users/certificates/:certificateId/image')
    @ApiOkResponse({ description: 'Certificate image file' })
    async getCertificateImage(
        @Param('certificateId', ParseIntPipe) certificateId: number,
        @Res() res: Response,
    ): Promise<void> {
        const imagePath = await this.getCertificateImageUseCase.execute(certificateId);

        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
        });

        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }

    @Delete('users/certificates/:certificateId/image')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    async deleteCertificateImage(
        @CurrentUser() user: User,
        @Param('certificateId', ParseIntPipe) certificateId: number,
    ): Promise<void> {
        await this.deleteCertificateImageUseCase.execute(user.id, certificateId);
    }
}

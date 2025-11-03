import {
    Get,
    Put,
    Body,
    Post,
    Param,
    Patch,
    Delete,
    HttpCode,
    UseGuards,
    Controller,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import {
    GetEducationsUseCase,
    CreateEducationUseCase,
    DeleteEducationUseCase,
    UpdateEducationUseCase,
} from './user-components/use-cases/education.use-case';
import {
    GetExperiencesUseCase,
    CreateExperienceUseCase,
    DeleteExperienceUseCase,
    UpdateExperienceUseCase,
} from './user-components/use-cases/experience.use-case';
import {
    GetCertificatesUseCase,
    CreateCertificateUseCase,
    DeleteCertificateUseCase,
    UpdateCertificateUseCase,
} from './user-components/use-cases/certificate.use-case';
import {
    ComponentNotFoundException,
    InvalidEducationDatesException,
    InvalidExperiencePositionDatesException,
} from './user-components/exceptions/user-component.exceptions';
import {
    LinkCertificateToEducationUseCase,
    UnlinkCertificateFromEducationUseCase,
} from './user-components/use-cases/link-certificate-education.use-case';
import { User } from './entities/user.entity';
import { OwnerGuard } from '../@common/guards/owner.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../@common/guards/jwt-auth.guard';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UnauthorizedAccessException } from './exceptions/unauthorized-access.exception';
import { EmailAlreadyExistsException } from './exceptions/email-already-exists.exception';
import { ApiTags, ApiOkResponse, ApiNoContentResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserComponentEducationDto } from './user-components/dto/user-component-education.dto';
import { UserComponentExperienceDto } from './user-components/dto/user-component-experience.dto';
import { InvalidCurrentPasswordException } from './exceptions/invalid-current-password.exception';
import { UserComponentCertificateDto } from './user-components/dto/user-component-certificate.dto';
import { UpdateAboutMeUseCase, GetAboutMeUseCase } from './user-components/use-cases/about-me.use-case';
import { UpdateUserComponentAboutMeDto } from './user-components/dto/update-user-component-about-me.dto';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';
import { UpdateUserComponentEducationDto } from './user-components/dto/update-user-component-education.dto';
import { UpdateUserComponentExperienceDto } from './user-components/dto/update-user-component-experience.dto';
import { UpdateUserComponentCertificateDto } from './user-components/dto/update-user-component-certificate.dto';

@ApiBearerAuth()
@Controller(':username/users')
@ApiTags('Administration Users')
export class UsersController {
    constructor(
        private readonly getAboutMeUseCase: GetAboutMeUseCase,
        private readonly getProfileUseCase: GetProfileUseCase,
        private readonly getEducationsUseCase: GetEducationsUseCase,
        private readonly updateAboutMeUseCase: UpdateAboutMeUseCase,
        private readonly updateProfileUseCase: UpdateProfileUseCase,
        private readonly getExperiencesUseCase: GetExperiencesUseCase,
        private readonly createEducationUseCase: CreateEducationUseCase,
        private readonly deleteEducationUseCase: DeleteEducationUseCase,
        private readonly getCertificatesUseCase: GetCertificatesUseCase,
        private readonly updateEducationUseCase: UpdateEducationUseCase,
        private readonly createExperienceUseCase: CreateExperienceUseCase,
        private readonly deleteExperienceUseCase: DeleteExperienceUseCase,
        private readonly updateExperienceUseCase: UpdateExperienceUseCase,
        private readonly createCertificateUseCase: CreateCertificateUseCase,
        private readonly deleteCertificateUseCase: DeleteCertificateUseCase,
        private readonly updateCertificateUseCase: UpdateCertificateUseCase,
        private readonly linkCertificateToEducationUseCase: LinkCertificateToEducationUseCase,
        private readonly unlinkCertificateFromEducationUseCase: UnlinkCertificateFromEducationUseCase,
    ) { }

    // ==================== PROFILE ENDPOINTS ====================

    @Get('profile')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: () => User })
    @ApiExceptionResponse(() => [UserNotFoundException, UnauthorizedAccessException])
    async getProfile(@Param('username') username: string): Promise<User> {
        return await this.getProfileUseCase.execute(username);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: () => User })
    @ApiExceptionResponse(() => [UserNotFoundException, InvalidCurrentPasswordException, EmailAlreadyExistsException, UnauthorizedAccessException])
    async updateProfile(
        @Param('username') username: string,
        @Body() updateProfileDto: UpdateProfileDto,
    ): Promise<User> {
        return await this.updateProfileUseCase.execute(username, updateProfileDto);
    }

    // ==================== ABOUT ME ENDPOINTS ====================

    @Get('about-me')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [UserNotFoundException, UnauthorizedAccessException])
    async getAboutMe(@Param('username') username: string) {
        return await this.getAboutMeUseCase.execute(username);
    }

    @Patch('about-me')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, UnauthorizedAccessException])
    async updateAboutMe(
        @Param('username') username: string,
        @Body() dto: UpdateUserComponentAboutMeDto,
    ) {
        return await this.updateAboutMeUseCase.execute(username, dto);
    }

    // ==================== EDUCATION ENDPOINTS ====================

    @Get('educations')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [UserNotFoundException, UnauthorizedAccessException])
    async getEducations(@Param('username') username: string) {
        return await this.getEducationsUseCase.execute(username);
    }

    @Post('educations')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [InvalidEducationDatesException, UnauthorizedAccessException])
    async createEducation(
        @Param('username') username: string,
        @Body() dto: UserComponentEducationDto,
    ) {
        return await this.createEducationUseCase.execute(username, dto);
    }

    @Put('educations/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, InvalidEducationDatesException, UnauthorizedAccessException])
    async updateEducation(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserComponentEducationDto,
    ) {
        return await this.updateEducationUseCase.execute(id, dto);
    }

    @Delete('educations/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, UnauthorizedAccessException])
    async deleteEducation(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.deleteEducationUseCase.execute(id);
    }

    // ==================== EXPERIENCE ENDPOINTS ====================

    @Get('experiences')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [UserNotFoundException, UnauthorizedAccessException])
    async getExperiences(@Param('username') username: string) {
        return await this.getExperiencesUseCase.execute(username);
    }

    @Post('experiences')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [InvalidExperiencePositionDatesException, UnauthorizedAccessException])
    async createExperience(
        @Param('username') username: string,
        @Body() dto: UserComponentExperienceDto,
    ) {
        return await this.createExperienceUseCase.execute(username, dto);
    }

    @Put('experiences/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, InvalidExperiencePositionDatesException, UnauthorizedAccessException])
    async updateExperience(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserComponentExperienceDto,
    ) {
        return await this.updateExperienceUseCase.execute(id, dto);
    }

    @Delete('experiences/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, UnauthorizedAccessException])
    async deleteExperience(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.deleteExperienceUseCase.execute(id);
    }

    // ==================== CERTIFICATE ENDPOINTS ====================

    @Get('certificates')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [UserNotFoundException, UnauthorizedAccessException])
    async getCertificates(@Param('username') username: string) {
        return await this.getCertificatesUseCase.execute(username);
    }

    @Post('certificates')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse()
    @ApiExceptionResponse(() => UnauthorizedAccessException)
    async createCertificate(
        @Param('username') username: string,
        @Body() dto: UserComponentCertificateDto,
    ) {
        return await this.createCertificateUseCase.execute(username, dto);
    }

    @Put('certificates/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, UnauthorizedAccessException])
    async updateCertificate(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserComponentCertificateDto,
    ) {
        return await this.updateCertificateUseCase.execute(id, dto);
    }

    @Delete('certificates/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, UnauthorizedAccessException])
    async deleteCertificate(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.deleteCertificateUseCase.execute(id);
    }

    // ==================== CERTIFICATE-EDUCATION LINK ENDPOINTS ====================

    @Post('certificates/:certificateId/link-education/:educationId')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, UnauthorizedAccessException])
    async linkCertificateToEducation(
        @Param('username') username: string,
        @Param('certificateId', ParseIntPipe) certificateId: number,
        @Param('educationId', ParseIntPipe) educationId: number,
    ) {
        await this.linkCertificateToEducationUseCase.execute(username, certificateId, educationId);
    }

    @Delete('certificates/:certificateId/unlink-education/:educationId')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, UnauthorizedAccessException])
    async unlinkCertificateFromEducation(
        @Param('username') username: string,
        @Param('certificateId', ParseIntPipe) certificateId: number,
        @Param('educationId', ParseIntPipe) educationId: number,
    ) {
        await this.unlinkCertificateFromEducationUseCase.execute(username, certificateId, educationId);
    }
};

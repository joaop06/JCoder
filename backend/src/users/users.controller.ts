import {
    Get,
    Post,
    Put,
    Body,
    Param,
    Patch,
    Delete,
    Query,
    HttpCode,
    UseGuards,
    Controller,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import {
    GetCertificateUseCase,
    GetCertificatesUseCase,
    CreateCertificateUseCase,
    DeleteCertificateUseCase,
    UpdateCertificateUseCase,
} from './user-components/use-cases/certificate.use-case';
import {
    GetEducationUseCase,
    GetEducationsUseCase,
    CreateEducationUseCase,
    DeleteEducationUseCase,
    UpdateEducationUseCase,
} from './user-components/use-cases/education.use-case';
import {
    GetExperienceUseCase,
    GetExperiencesUseCase,
    CreateExperienceUseCase,
    DeleteExperienceUseCase,
    UpdateExperienceUseCase,
} from './user-components/use-cases/experience.use-case';
import {
    ComponentNotFoundException,
    InvalidEducationDatesException,
    InvalidExperiencePositionDatesException,
} from './user-components/exceptions/user-component.exceptions';
import { User } from './entities/user.entity';
import { OwnerGuard } from '../@common/guards/owner.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../@common/dto/pagination.dto';
import { JwtAuthGuard } from '../@common/guards/jwt-auth.guard';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UnauthorizedAccessException } from './exceptions/unauthorized-access.exception';
import { EmailAlreadyExistsException } from './exceptions/email-already-exists.exception';
import { UserComponentAboutMeDto } from './user-components/dto/user-component-about-me.dto';
import { UserComponentEducationDto } from './user-components/dto/user-component-education.dto';
import { UserComponentExperienceDto } from './user-components/dto/user-component-experience.dto';
import { InvalidCurrentPasswordException } from './exceptions/invalid-current-password.exception';
import { UserComponentCertificateDto } from './user-components/dto/user-component-certificate.dto';
import { UpdateUserComponentAboutMeDto } from './user-components/dto/update-user-component-about-me.dto';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';
import { UpdateUserComponentEducationDto } from './user-components/dto/update-user-component-education.dto';
import { GetEducationsPaginatedUseCase } from './user-components/use-cases/get-educations-paginated.use-case';
import { UpdateUserComponentExperienceDto } from './user-components/dto/update-user-component-experience.dto';
import { GetExperiencesPaginatedUseCase } from './user-components/use-cases/get-experiences-paginated.use-case';
import { UpdateUserComponentCertificateDto } from './user-components/dto/update-user-component-certificate.dto';
import { GetCertificatesPaginatedUseCase } from './user-components/use-cases/get-certificates-paginated.use-case';
import { CreateOrUpdateAboutMeUseCase, UpdateAboutMeUseCase, GetAboutMeUseCase } from './user-components/use-cases/about-me.use-case';

@Controller('users')
export class UsersController {
    constructor(
        private readonly getAboutMeUseCase: GetAboutMeUseCase,
        private readonly getProfileUseCase: GetProfileUseCase,
        private readonly getEducationUseCase: GetEducationUseCase,
        private readonly getEducationsUseCase: GetEducationsUseCase,
        private readonly getExperienceUseCase: GetExperienceUseCase,
        private readonly updateAboutMeUseCase: UpdateAboutMeUseCase,
        private readonly updateProfileUseCase: UpdateProfileUseCase,
        private readonly getCertificateUseCase: GetCertificateUseCase,
        private readonly getExperiencesUseCase: GetExperiencesUseCase,
        private readonly createEducationUseCase: CreateEducationUseCase,
        private readonly deleteEducationUseCase: DeleteEducationUseCase,
        private readonly updateEducationUseCase: UpdateEducationUseCase,
        private readonly getCertificatesUseCase: GetCertificatesUseCase,
        private readonly createExperienceUseCase: CreateExperienceUseCase,
        private readonly deleteExperienceUseCase: DeleteExperienceUseCase,
        private readonly updateExperienceUseCase: UpdateExperienceUseCase,
        private readonly createCertificateUseCase: CreateCertificateUseCase,
        private readonly deleteCertificateUseCase: DeleteCertificateUseCase,
        private readonly updateCertificateUseCase: UpdateCertificateUseCase,
        private readonly createOrUpdateAboutMeUseCase: CreateOrUpdateAboutMeUseCase,
        private readonly getEducationsPaginatedUseCase: GetEducationsPaginatedUseCase,
        private readonly getExperiencesPaginatedUseCase: GetExperiencesPaginatedUseCase,
        private readonly getCertificatesPaginatedUseCase: GetCertificatesPaginatedUseCase,
    ) { }

    // Profile endpoints
    @Get(':username/profile')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: () => User })
    @ApiExceptionResponse(() => UserNotFoundException)
    async getProfile(@Param('username') username: string): Promise<User> {
        return await this.getProfileUseCase.execute(username);
    }

    @Patch(':username/profile')
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

    // Public endpoints (for homepage)
    @Get(':username/about-me')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => UserNotFoundException)
    async getAboutMe(@Param('username') username: string) {
        return await this.getAboutMeUseCase.execute(username);
    }

    @Get(':username/educations')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => UserNotFoundException)
    async getEducations(@Param('username') username: string) {
        return await this.getEducationsUseCase.execute(username);
    }

    @Get(':username/experiences')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => UserNotFoundException)
    async getExperiences(@Param('username') username: string) {
        return await this.getExperiencesUseCase.execute(username);
    }

    @Get(':username/certificates')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => UserNotFoundException)
    async getCertificates(@Param('username') username: string) {
        return await this.getCertificatesUseCase.execute(username);
    }

    // About Me endpoints (authenticated)
    @Post(':username/about-me')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException])
    async createOrUpdateAboutMe(
        @Param('username') username: string,
        @Body() dto: UserComponentAboutMeDto,
    ) {
        return await this.createOrUpdateAboutMeUseCase.execute(username, dto);
    }

    @Patch(':username/about-me')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async updateAboutMe(
        @Param('username') username: string,
        @Body() dto: UpdateUserComponentAboutMeDto,
    ) {
        return await this.updateAboutMeUseCase.execute(username, dto);
    }

    // Education endpoints
    @Post(':username/educations')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse()
    @ApiExceptionResponse(() => InvalidEducationDatesException)
    async createEducation(
        @Param('username') username: string,
        @Body() dto: UserComponentEducationDto,
    ) {
        return await this.createEducationUseCase.execute(username, dto);
    }

    @Put(':username/educations/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, InvalidEducationDatesException])
    async updateEducation(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserComponentEducationDto,
    ) {
        return await this.updateEducationUseCase.execute(id, dto);
    }

    @Get(':username/educations/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async getEducation(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.getEducationUseCase.execute(id);
    }

    @Delete(':username/educations/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async deleteEducation(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.deleteEducationUseCase.execute(id);
    }

    // Experience endpoints
    @Post(':username/experiences')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse()
    @ApiExceptionResponse(() => InvalidExperiencePositionDatesException)
    async createExperience(
        @Param('username') username: string,
        @Body() dto: UserComponentExperienceDto,
    ) {
        return await this.createExperienceUseCase.execute(username, dto);
    }

    @Put(':username/experiences/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, InvalidExperiencePositionDatesException])
    async updateExperience(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserComponentExperienceDto,
    ) {
        return await this.updateExperienceUseCase.execute(id, dto);
    }

    @Get(':username/experiences/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async getExperience(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.getExperienceUseCase.execute(id);
    }

    @Delete(':username/experiences/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async deleteExperience(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.deleteExperienceUseCase.execute(id);
    }

    // Certificate endpoints
    @Post(':username/certificates')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse()
    async createCertificate(
        @Param('username') username: string,
        @Body() dto: UserComponentCertificateDto,
    ) {
        return await this.createCertificateUseCase.execute(username, dto);
    }

    @Put(':username/certificates/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async updateCertificate(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserComponentCertificateDto,
    ) {
        return await this.updateCertificateUseCase.execute(id, dto);
    }

    @Get(':username/certificates/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async getCertificate(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.getCertificateUseCase.execute(id);
    }

    @Delete(':username/certificates/:id')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async deleteCertificate(
        @Param('username') username: string,
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.deleteCertificateUseCase.execute(id);
    }

    // Paginated endpoints
    @Get(':username/educations/paginated')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getEducationsPaginated(
        @Param('username') username: string,
        @Query() pagination: PaginationDto,
    ) {
        return await this.getEducationsPaginatedUseCase.execute(username, pagination);
    }

    @Get(':username/experiences/paginated')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getExperiencesPaginated(
        @Param('username') username: string,
        @Query() pagination: PaginationDto,
    ) {
        return await this.getExperiencesPaginatedUseCase.execute(username, pagination);
    }

    @Get(':username/certificates/paginated')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getCertificatesPaginated(
        @Param('username') username: string,
        @Query() pagination: PaginationDto,
    ) {
        return await this.getCertificatesPaginatedUseCase.execute(username, pagination);
    }
};

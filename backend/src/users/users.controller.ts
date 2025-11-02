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
    UseInterceptors,
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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../@common/dto/pagination.dto';
import { JwtAuthGuard } from '../@common/guards/jwt-auth.guard';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { CurrentUser } from '../@common/decorators/current-user/current-user.decorator';
import { EmailAlreadyExistsException } from './exceptions/email-already-exists.exception';
import { UsersService } from './users.service';
import { RoleEnum } from '../@common/enums/role.enum';
import { UserComponentAboutMeDto } from './user-components/dto/user-component-about-me.dto';
import { UserComponentEducationDto } from './user-components/dto/user-component-education.dto';
import { UserComponentExperienceDto } from './user-components/dto/user-component-experience.dto';
import { InvalidCurrentPasswordException } from './exceptions/invalid-current-password.exception';
import { UserComponentCertificateDto } from './user-components/dto/user-component-certificate.dto';
import { UpdateUserComponentAboutMeDto } from './user-components/dto/update-user-component-about-me.dto';
import { UpdateUserComponentEducationDto } from './user-components/dto/update-user-component-education.dto';
import { ApiExceptionResponse } from '../@common/decorators/documentation/api-exception-response.decorator';
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
        private readonly usersService: UsersService,
    ) { }

    // Helper method to get admin user ID (provisório)
    private async getAdminUserId(): Promise<number> {
        const adminUserId = await this.usersService.findAdminUserId();

        if (!adminUserId) {
            // Fallback to userId = 1 if no admin found
            return 1;
        }

        return adminUserId;
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: () => User })
    @ApiExceptionResponse(() => UserNotFoundException)
    async getProfile(@CurrentUser() user: User): Promise<User> {
        return await this.getProfileUseCase.execute(user.id);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: () => User })
    @ApiExceptionResponse(() => UserNotFoundException)
    @ApiExceptionResponse(() => InvalidCurrentPasswordException)
    @ApiExceptionResponse(() => EmailAlreadyExistsException)
    async updateProfile(
        @CurrentUser() user: User,
        @Body() updateProfileDto: UpdateProfileDto,
    ): Promise<User> {
        return await this.updateProfileUseCase.execute(user.id, updateProfileDto);
    }

    // About Me endpoints
    @Post('profile/about-me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException])
    async createOrUpdateAboutMe(
        @CurrentUser() user: User,
        @Body() dto: UserComponentAboutMeDto,
    ) {
        return await this.createOrUpdateAboutMeUseCase.execute(user.id, dto);
    }

    @Patch('profile/about-me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async updateAboutMe(
        @CurrentUser() user: User,
        @Body() dto: UpdateUserComponentAboutMeDto,
    ) {
        return await this.updateAboutMeUseCase.execute(user.id, dto);
    }

    // Public endpoints (for homepage)
    @Get('public/about-me')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getPublicAboutMe() {
        // Buscar usuário admin primeiro e usar o ID
        const adminUserId = await this.getAdminUserId();
        return await this.getAboutMeUseCase.execute(adminUserId);
    }

    @Get('public/educations')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getPublicEducations() {
        // Buscar usuário admin primeiro e usar o ID
        const adminUserId = await this.getAdminUserId();
        return await this.getEducationsUseCase.execute(adminUserId);
    }

    @Get('public/experiences')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getPublicExperiences() {
        // Buscar usuário admin primeiro e usar o ID
        const adminUserId = await this.getAdminUserId();
        return await this.getExperiencesUseCase.execute(adminUserId);
    }

    @Get('public/certificates')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getPublicCertificates() {
        // Buscar usuário admin primeiro e usar o ID
        const adminUserId = await this.getAdminUserId();
        return await this.getCertificatesUseCase.execute(adminUserId);
    }

    @Get('public/profile')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: () => User })
    async getPublicProfile() {
        // Buscar usuário admin primeiro e usar o ID
        const adminUserId = await this.getAdminUserId();
        // Retornar apenas dados básicos do perfil (email, fullName, githubUrl, linkedinUrl)
        return await this.usersService.findBasicProfile(adminUserId);
    }

    @Get('profile/about-me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getAboutMe(@CurrentUser() user: User) {
        return await this.getAboutMeUseCase.execute(user.id);
    }

    // Education endpoints
    @Post('profile/educations')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse()
    @ApiExceptionResponse(() => InvalidEducationDatesException)
    async createEducation(
        @CurrentUser() user: User,
        @Body() dto: UserComponentEducationDto,
    ) {
        return await this.createEducationUseCase.execute(user.id, dto);
    }

    @Put('profile/educations/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, InvalidEducationDatesException])
    async updateEducation(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserComponentEducationDto,
    ) {
        return await this.updateEducationUseCase.execute(id, dto);
    }

    @Get('profile/educations')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getEducations(@CurrentUser() user: User) {
        return await this.getEducationsUseCase.execute(user.id);
    }

    @Get('profile/educations/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async getEducation(@Param('id', ParseIntPipe) id: number) {
        return await this.getEducationUseCase.execute(id);
    }

    @Delete('profile/educations/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async deleteEducation(@Param('id', ParseIntPipe) id: number) {
        await this.deleteEducationUseCase.execute(id);
    }

    // Experience endpoints
    @Post('profile/experiences')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse()
    @ApiExceptionResponse(() => InvalidExperiencePositionDatesException)
    async createExperience(
        @CurrentUser() user: User,
        @Body() dto: UserComponentExperienceDto,
    ) {
        return await this.createExperienceUseCase.execute(user.id, dto);
    }

    @Put('profile/experiences/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => [ComponentNotFoundException, InvalidExperiencePositionDatesException])
    async updateExperience(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserComponentExperienceDto,
    ) {
        return await this.updateExperienceUseCase.execute(id, dto);
    }

    @Get('profile/experiences')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getExperiences(@CurrentUser() user: User) {
        return await this.getExperiencesUseCase.execute(user.id);
    }

    @Get('profile/experiences/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async getExperience(@Param('id', ParseIntPipe) id: number) {
        return await this.getExperienceUseCase.execute(id);
    }

    @Delete('profile/experiences/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async deleteExperience(@Param('id', ParseIntPipe) id: number) {
        await this.deleteExperienceUseCase.execute(id);
    }

    // Certificate endpoints
    @Post('profile/certificates')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse()
    async createCertificate(
        @CurrentUser() user: User,
        @Body() dto: UserComponentCertificateDto,
    ) {
        return await this.createCertificateUseCase.execute(user.id, dto);
    }

    @Put('profile/certificates/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async updateCertificate(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserComponentCertificateDto,
    ) {
        return await this.updateCertificateUseCase.execute(id, dto);
    }

    @Get('profile/certificates')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getCertificates(@CurrentUser() user: User) {
        return await this.getCertificatesUseCase.execute(user.id);
    }

    @Get('profile/certificates/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async getCertificate(@Param('id', ParseIntPipe) id: number) {
        return await this.getCertificateUseCase.execute(id);
    }

    @Delete('profile/certificates/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiExceptionResponse(() => ComponentNotFoundException)
    async deleteCertificate(@Param('id', ParseIntPipe) id: number) {
        await this.deleteCertificateUseCase.execute(id);
    }

    // Paginated endpoints
    @Get('profile/educations/paginated')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getEducationsPaginated(
        @CurrentUser() user: User,
        @Query() pagination: PaginationDto,
    ) {
        return await this.getEducationsPaginatedUseCase.execute(user.id, pagination);
    }

    @Get('profile/experiences/paginated')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getExperiencesPaginated(
        @CurrentUser() user: User,
        @Query() pagination: PaginationDto,
    ) {
        return await this.getExperiencesPaginatedUseCase.execute(user.id, pagination);
    }

    @Get('profile/certificates/paginated')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse()
    async getCertificatesPaginated(
        @CurrentUser() user: User,
        @Query() pagination: PaginationDto,
    ) {
        return await this.getCertificatesPaginatedUseCase.execute(user.id, pagination);
    }

};


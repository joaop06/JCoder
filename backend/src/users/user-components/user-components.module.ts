import {
    GetAboutMeUseCase,
    UpdateAboutMeUseCase,
    CreateOrUpdateAboutMeUseCase,
} from './use-cases/about-me.use-case';
import {
    GetCertificateUseCase,
    GetCertificatesUseCase,
    CreateCertificateUseCase,
    DeleteCertificateUseCase,
    UpdateCertificateUseCase,
} from './use-cases/certificate.use-case';
import {
    GetEducationUseCase,
    GetEducationsUseCase,
    CreateEducationUseCase,
    DeleteEducationUseCase,
    UpdateEducationUseCase,
} from './use-cases/education.use-case';
import {
    GetExperienceUseCase,
    GetExperiencesUseCase,
    CreateExperienceUseCase,
    DeleteExperienceUseCase,
    UpdateExperienceUseCase,
} from './use-cases/experience.use-case';
import { UsersModule } from '../users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { UserComponentsService } from './user-components.service';
import { UserComponentsRepository } from './user-components.repository';
import { UserComponentAboutMe } from './entities/user-component-about-me.entity';
import { UserComponentEducation } from './entities/user-component-education.entity';
import { UserComponentExperience } from './entities/user-component-experience.entity';
import { UserComponentCertificate } from './entities/user-component-certificate.entity';
import { GetEducationsPaginatedUseCase } from './use-cases/get-educations-paginated.use-case';
import { GetExperiencesPaginatedUseCase } from './use-cases/get-experiences-paginated.use-case';
import { GetCertificatesPaginatedUseCase } from './use-cases/get-certificates-paginated.use-case';
import { UserComponentAboutMeHighlight } from './entities/user-component-about-me-highlight.entity';
import { UserComponentExperiencePosition } from './entities/user-component-experience-position.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserComponentAboutMe,
            UserComponentEducation,
            UserComponentExperience,
            UserComponentCertificate,
            UserComponentAboutMeHighlight,
            UserComponentExperiencePosition,
        ]),
        forwardRef(() => UsersModule),
    ],
    exports: [
        UserComponentsService,
        UserComponentsRepository,

        /** About Me */
        GetAboutMeUseCase,
        UpdateAboutMeUseCase,
        CreateOrUpdateAboutMeUseCase,

        /** Education */
        GetEducationUseCase,
        GetEducationsUseCase,
        CreateEducationUseCase,
        DeleteEducationUseCase,
        UpdateEducationUseCase,

        /** Experience */
        GetExperienceUseCase,
        GetExperiencesUseCase,
        CreateExperienceUseCase,
        DeleteExperienceUseCase,
        UpdateExperienceUseCase,

        /** Certificate */
        GetCertificateUseCase,
        GetCertificatesUseCase,
        CreateCertificateUseCase,
        DeleteCertificateUseCase,
        UpdateCertificateUseCase,

        /** Paginated */
        GetEducationsPaginatedUseCase,
        GetExperiencesPaginatedUseCase,
        GetCertificatesPaginatedUseCase,
    ],
    providers: [
        UserComponentsService,
        UserComponentsRepository,

        /** About Me */
        GetAboutMeUseCase,
        UpdateAboutMeUseCase,
        CreateOrUpdateAboutMeUseCase,

        /** Education */
        GetEducationUseCase,
        GetEducationsUseCase,
        CreateEducationUseCase,
        DeleteEducationUseCase,
        UpdateEducationUseCase,

        /** Experience */
        GetExperienceUseCase,
        GetExperiencesUseCase,
        CreateExperienceUseCase,
        DeleteExperienceUseCase,
        UpdateExperienceUseCase,

        /** Certificate */
        GetCertificateUseCase,
        GetCertificatesUseCase,
        CreateCertificateUseCase,
        DeleteCertificateUseCase,
        UpdateCertificateUseCase,

        /** Paginated */
        GetEducationsPaginatedUseCase,
        GetExperiencesPaginatedUseCase,
        GetCertificatesPaginatedUseCase,
    ],
})
export class UserComponentsModule { };

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
import { UserComponentAboutMeHighlight } from './entities/user-component-about-me-highlight.entity';
import {
    LinkCertificateToEducationUseCase,
    UnlinkCertificateFromEducationUseCase,
} from './use-cases/link-certificate-education.use-case';
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

        /** Certificate-Education Link */
        LinkCertificateToEducationUseCase,
        UnlinkCertificateFromEducationUseCase,
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

        /** Certificate-Education Link */
        LinkCertificateToEducationUseCase,
        UnlinkCertificateFromEducationUseCase,
    ],
})
export class UserComponentsModule { };

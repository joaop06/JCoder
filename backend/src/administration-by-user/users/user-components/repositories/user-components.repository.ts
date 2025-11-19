import { Injectable } from '@nestjs/common';
import { AboutMeRepository } from './about-me.repository';
import { EducationRepository } from './education.repository';
import { ReferenceRepository } from './reference.repository';
import { ExperienceRepository } from './experience.repository';
import { CertificateRepository } from './certificate.repository';

@Injectable()
export class UserComponentsRepository {
    constructor(
        public readonly aboutMeRepository: AboutMeRepository,
        public readonly educationRepository: EducationRepository,
        public readonly referenceRepository: ReferenceRepository,
        public readonly experienceRepository: ExperienceRepository,
        public readonly certificateRepository: CertificateRepository,
    ) { }
};

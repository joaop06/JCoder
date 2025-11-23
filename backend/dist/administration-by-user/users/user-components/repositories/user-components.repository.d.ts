import { AboutMeRepository } from './about-me.repository';
import { EducationRepository } from './education.repository';
import { ReferenceRepository } from './reference.repository';
import { ExperienceRepository } from './experience.repository';
import { CertificateRepository } from './certificate.repository';
export declare class UserComponentsRepository {
    readonly aboutMeRepository: AboutMeRepository;
    readonly educationRepository: EducationRepository;
    readonly referenceRepository: ReferenceRepository;
    readonly experienceRepository: ExperienceRepository;
    readonly certificateRepository: CertificateRepository;
    constructor(aboutMeRepository: AboutMeRepository, educationRepository: EducationRepository, referenceRepository: ReferenceRepository, experienceRepository: ExperienceRepository, certificateRepository: CertificateRepository);
}

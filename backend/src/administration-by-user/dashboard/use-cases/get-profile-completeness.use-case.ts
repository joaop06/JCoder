import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { CacheService } from '../../../@common/services/cache.service';
import { ProfileCompletenessDto } from '../dto/dashboard-response.dto';
import { UserComponentAboutMe } from '../../users/user-components/entities/user-component-about-me.entity';
import { UserComponentEducation } from '../../users/user-components/entities/user-component-education.entity';
import { UserComponentExperience } from '../../users/user-components/entities/user-component-experience.entity';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
import { UserComponentReference } from '../../users/user-components/entities/user-component-reference.entity';

@Injectable()
export class GetProfileCompletenessUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
    @InjectRepository(UserComponentAboutMe)
    private readonly aboutMeRepository: Repository<UserComponentAboutMe>,
    @InjectRepository(UserComponentEducation)
    private readonly educationRepository: Repository<UserComponentEducation>,
    @InjectRepository(UserComponentExperience)
    private readonly experienceRepository: Repository<UserComponentExperience>,
    @InjectRepository(UserComponentCertificate)
    private readonly certificateRepository: Repository<UserComponentCertificate>,
    @InjectRepository(UserComponentReference)
    private readonly referenceRepository: Repository<UserComponentReference>,
  ) {}

  async execute(username: string): Promise<ProfileCompletenessDto> {
    const cacheKey = this.cacheService.generateKey('dashboard', 'profile-completeness', username);

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Optimized: Load only user basic data, not all components
        const user = await this.usersService.findOneBy({ username });

        if (!user) {
          return this.getEmptyCompleteness();
        }

        // Optimized: Check component existence with lightweight count queries
        const [hasAboutMe, educationCount, experienceCount, certificateCount, referenceCount] =
          await Promise.all([
            this.aboutMeRepository.count({ where: { userId: user.id } }),
            this.educationRepository.count({ where: { user: { id: user.id } } }),
            this.experienceRepository.count({ where: { user: { id: user.id } } }),
            this.certificateRepository.count({ where: { user: { id: user.id } } }),
            this.referenceRepository.count({ where: { user: { id: user.id } } }),
          ]);

        const fields = {
          profileImage: !!user.profileImage,
          fullName: !!user.fullName,
          email: !!user.email,
          phone: !!user.phone,
          address: !!user.address,
          githubUrl: !!user.githubUrl,
          linkedinUrl: !!user.linkedinUrl,
          aboutMe: hasAboutMe > 0,
          education: educationCount > 0,
          experience: experienceCount > 0,
          certificates: certificateCount > 0,
          references: referenceCount > 0,
        };

        const completedFields = Object.values(fields).filter(Boolean).length;
        const totalFields = Object.keys(fields).length;
        const percentage = Math.round((completedFields / totalFields) * 100);

        return {
          fields,
          percentage,
          totalFields,
          completedFields,
        };
      },
      300, // 5 minutes cache (profile doesn't change frequently)
    );
  }

  private getEmptyCompleteness(): ProfileCompletenessDto {
    return {
      percentage: 0,
      completedFields: 0,
      totalFields: 12,
      fields: {
        profileImage: false,
        fullName: false,
        email: false,
        phone: false,
        address: false,
        githubUrl: false,
        linkedinUrl: false,
        aboutMe: false,
        education: false,
        experience: false,
        certificates: false,
        references: false,
      },
    };
  }
}


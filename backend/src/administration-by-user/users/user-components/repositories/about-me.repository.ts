import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users.service';
import { CacheService } from '../../../../@common/services/cache.service';
import { UserComponentAboutMe } from '../entities/user-component-about-me.entity';
import { CreateUserComponentAboutMeDto } from '../dto/create-user-component-about-me.dto';
import { UpdateUserComponentAboutMeDto } from '../dto/update-user-component-about-me.dto';
import { UserComponentAboutMeHighlight } from '../entities/user-component-about-me-highlight.entity';

@Injectable()
export class AboutMeRepository {
    constructor(
        private readonly cacheService: CacheService,

        private readonly usersService: UsersService,

        @InjectRepository(UserComponentAboutMe)
        private readonly aboutMeRepository: Repository<UserComponentAboutMe>,

        @InjectRepository(UserComponentAboutMeHighlight)
        private readonly aboutMeHighlightRepository: Repository<UserComponentAboutMeHighlight>,
    ) { }

    async findByUsername(
        username: string,
    ): Promise<UserComponentAboutMe> {
        const cacheKey = this.cacheService.generateKey('about-me', 'paginated', username);

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const aboutMe = await this.aboutMeRepository.findOne({
                    relations: ['highlights'],
                    where: { user: { username } },
                });

                return aboutMe;
            },
            300, // 5 minutes cache
        );
    }

    async create(user: User, data: CreateUserComponentAboutMeDto): Promise<UserComponentAboutMe> {
        const aboutMe = this.aboutMeRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.aboutMeRepository.save(aboutMe);
    }

    async update(username: string, data: UpdateUserComponentAboutMeDto): Promise<UserComponentAboutMe> {
        const user = await this.usersService.findOneBy({ username });

        // Extract highlights from data if present
        const { highlights, ...aboutMeData } = data;

        // Update about me (excluding highlights)
        await this.aboutMeRepository.update({ userId: user.id }, aboutMeData);

        // If highlights are provided, save them
        if (highlights !== undefined) {
            const aboutMe = await this.aboutMeRepository.findOne({ where: { userId: user.id } });
            if (aboutMe) {
                await this.saveHighlights(aboutMe.id, highlights);
            }
        }

        return await this.aboutMeRepository.findOne({
            where: { userId: user.id },
            relations: ['highlights'],
        });
    }

    async createHighlight(aboutMeId: number, data: Partial<UserComponentAboutMeHighlight>): Promise<UserComponentAboutMeHighlight> {
        const highlight = this.aboutMeHighlightRepository.create({
            ...data,
            aboutMeId,
        });
        return await this.aboutMeHighlightRepository.save(highlight);
    }

    async saveHighlights(aboutMeId: number, highlights: Partial<UserComponentAboutMeHighlight>[]): Promise<UserComponentAboutMeHighlight[]> {
        // Delete existing highlights
        await this.deleteHighlights(aboutMeId);

        // Create new highlights
        const savedHighlights = [];
        for (const highlight of highlights) {
            const saved = await this.createHighlight(aboutMeId, highlight);
            savedHighlights.push(saved);
        }
        return savedHighlights;
    }

    async deleteHighlights(aboutMeId: number): Promise<void> {
        await this.aboutMeHighlightRepository.delete({
            aboutMeId,
        });
    }
};

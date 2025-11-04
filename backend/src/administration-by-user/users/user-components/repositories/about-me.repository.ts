import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from '../../../../@common/services/cache.service';
import { UserComponentAboutMe } from '../entities/user-component-about-me.entity';
import { UserComponentAboutMeHighlight } from '../entities/user-component-about-me-highlight.entity';

@Injectable()
export class AboutMeRepository {
    constructor(
        private readonly cacheService: CacheService,

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
                    where: { username },
                    relations: ['highlights'],
                });

                return aboutMe;
            },
            300, // 5 minutes cache
        );
    }

    async create(user: User, data: Partial<UserComponentAboutMe>): Promise<UserComponentAboutMe> {
        const aboutMe = this.aboutMeRepository.create({
            ...data,
            username: user.username,
            user,
        });
        return await this.aboutMeRepository.save(aboutMe);
    }

    async update(username: string, data: Partial<UserComponentAboutMe>): Promise<UserComponentAboutMe> {
        await this.aboutMeRepository.update({ username }, data);
        return await this.aboutMeRepository.findOne({ where: { username } });
    }

    async createHighlight(aboutMeId: number, data: Partial<UserComponentAboutMeHighlight>): Promise<UserComponentAboutMeHighlight> {
        const highlight = this.aboutMeHighlightRepository.create({
            ...data,
            aboutMeId,
        });
        return await this.aboutMeHighlightRepository.save(highlight);
    }

    async saveHighlights(username: string, aboutMeId: number, highlights: Partial<UserComponentAboutMeHighlight>[]): Promise<UserComponentAboutMeHighlight[]> {
        // Find the about me record to get the aboutMeId
        const aboutMe = await this.findByUsername(username);
        if (!aboutMe) {
            throw new Error('About Me record not found');
        }

        // Delete existing highlights
        await this.deleteHighlights(aboutMe.id);

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

    async invalidateCache(userId?: number): Promise<void> {
        if (userId) {
            await this.cacheService.del(this.cacheService.generateKey('about-me', 'paginated', userId));
        } else {
            await this.cacheService.del(this.cacheService.generateKey('about-me', 'paginated'));
        }
    }
};

import { Injectable } from '@nestjs/common';
import { TechnologiesService } from '../technologies.service';

@Injectable()
export class GetTechnologyProfileImageUseCase {
    constructor(
        private readonly technologiesService: TechnologiesService,
    ) { }

    async execute(id: number): Promise<string> {
        const technology = await this.technologiesService.findById(id);

        if (!technology.profileImage) {
            throw new Error('Technology has no profile image');
        }

        return `uploads/technologies/${technology.profileImage}`;
    }
}


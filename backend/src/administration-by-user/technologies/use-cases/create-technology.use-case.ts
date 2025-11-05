import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { CreateTechnologyDto } from '../dto/create-technology.dto';
import { TechnologyAlreadyExistsException } from '../exceptions/technology-already-exists.exception';

@Injectable()
export class CreateTechnologyUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly technologiesService: TechnologiesService,
    ) { }

    async execute(
        username: string,
        createTechnologyDto: CreateTechnologyDto,
    ): Promise<Technology> {
        // Verify if technology with same name already exists
        await this.existsTechnologyName(
            username,
            createTechnologyDto.name
        );

        // Find the user
        const user = await this.usersService.findOneBy({ username });

        // Increment displayOrder of all existing technologies
        // New technology will always be inserted at position 1
        await this.technologiesService.incrementDisplayOrderFrom(1, user.id);

        // Create the technology with displayOrder = 1
        const technologyData = {
            ...createTechnologyDto,
            username,
            displayOrder: 1,
        } as CreateTechnologyDto & { displayOrder: number };

        return await this.technologiesService.create(technologyData);
    }

    private async existsTechnologyName(username: string, name: string): Promise<void> {
        if (!name) return;

        const exists = await this.technologiesService.existsByTechnologyNameAndUsername(username, name);
        if (exists) throw new TechnologyAlreadyExistsException();
    }
};

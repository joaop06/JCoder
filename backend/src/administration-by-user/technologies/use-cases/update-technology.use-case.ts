import { Injectable } from '@nestjs/common';
import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { UpdateTechnologyDto } from '../dto/update-technology.dto';
import { TechnologyAlreadyExistsException } from '../exceptions/technology-already-exists.exception';

@Injectable()
export class UpdateTechnologyUseCase {
    constructor(private readonly technologiesService: TechnologiesService) { }

    async execute(
        id: number,
        username: string,
        updateTechnologyDto: UpdateTechnologyDto,
    ): Promise<Technology> {
        // Verify whether the technology exists for this user
        await this.technologiesService.findById(id, username);

        // Verify whether the Technology name already exists for this user
        await this.existsTechnologyName(username, id, updateTechnologyDto.name);

        // Update the technology
        return await this.technologiesService.update(id, updateTechnologyDto);
    }

    private async existsTechnologyName(username: string, id: number, name: string): Promise<void> {
        if (!name) return;

        const exists = await this.technologiesService.existsByTechnologyNameAndUsername(username, name);
        if (exists && exists.id !== id) throw new TechnologyAlreadyExistsException();
    }
};

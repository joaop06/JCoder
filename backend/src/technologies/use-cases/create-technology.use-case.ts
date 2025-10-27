import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { CreateTechnologyDto } from '../dto/create-technology.dto';
import { TechnologyAlreadyExistsException } from '../exceptions/technology-already-exists.exception';

@Injectable()
export class CreateTechnologyUseCase {
    private readonly logger = new Logger(CreateTechnologyUseCase.name);

    constructor(private readonly technologiesService: TechnologiesService) { }

    async execute(
        createTechnologyDto: CreateTechnologyDto,
    ): Promise<Technology> {
        try {
            this.logger.log(`Creating technology: ${createTechnologyDto.name}`);

            // Verify if technology with same name already exists
            const exists = await this.technologiesService.findOneBy({
                name: createTechnologyDto.name,
            });
            if (exists) {
                throw new TechnologyAlreadyExistsException(createTechnologyDto.name);
            }

            // Increment displayOrder of all existing technologies
            // New technology will always be inserted at position 1
            this.logger.log('Incrementing display order of existing technologies');
            await this.technologiesService.incrementDisplayOrderFrom(1);

            // Create the technology with displayOrder = 1
            const technologyData = {
                ...createTechnologyDto,
                displayOrder: 1,
            } as CreateTechnologyDto & { displayOrder: number };

            this.logger.log('Saving new technology to database');
            const result = await this.technologiesService.create(technologyData);

            this.logger.log(`Technology created successfully: ${result.id}`);
            return result;
        } catch (error) {
            this.logger.error('Error creating technology', error);
            if (error instanceof TechnologyAlreadyExistsException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create technology');
        }
    }
}


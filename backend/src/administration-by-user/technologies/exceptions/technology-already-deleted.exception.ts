import { BadRequestException } from '@nestjs/common';

export class TechnologyAlreadyDeletedException extends BadRequestException {
    constructor() {
        super('Technology is already deleted');
    }
}


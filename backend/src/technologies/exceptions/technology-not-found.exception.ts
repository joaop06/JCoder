import { NotFoundException } from '@nestjs/common';

export class TechnologyNotFoundException extends NotFoundException {
    constructor() {
        super('Technology is not found');
    }
}


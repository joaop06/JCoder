import { NotFoundException } from '@nestjs/common';

export class ReferenceNotFoundException extends NotFoundException {
    constructor() {
        super('Reference not found');
    }
}


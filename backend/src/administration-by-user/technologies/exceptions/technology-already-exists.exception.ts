import { ConflictException } from '@nestjs/common';

export class TechnologyAlreadyExistsException extends ConflictException {
    constructor(name?: string) {
        super(
            name
                ? `Technology with name '${name}' already exists`
                : 'Technology already exists',
        );
    }
}


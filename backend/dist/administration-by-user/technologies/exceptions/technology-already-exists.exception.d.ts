import { ConflictException } from '@nestjs/common';
export declare class TechnologyAlreadyExistsException extends ConflictException {
    constructor(name?: string);
}

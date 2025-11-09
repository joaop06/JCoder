import { ConflictException } from "@nestjs/common";

export class AlreadyExistsApplicationException extends ConflictException {
    constructor() {
        super('An application with this name already exists');
    }
};

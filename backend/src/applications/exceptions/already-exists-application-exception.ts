import { ConflictException } from "@nestjs/common";

export class AlreadyExistsApplicationException extends ConflictException {
    constructor() {
        super('Already exists a Application with this name');
    }
};

import { ConflictException } from "@nestjs/common";

export class UsernameAlreadyExistsException extends ConflictException {
    constructor() {
        super('Username already exists');
    }
};


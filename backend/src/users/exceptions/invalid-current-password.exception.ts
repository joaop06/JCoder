import { BadRequestException } from "@nestjs/common";

export class InvalidCurrentPasswordException extends BadRequestException {
    constructor() {
        super('Current password is invalid');
    }
};


import { BadRequestException } from "@nestjs/common";

export class AlreadyDeletedApplicationException extends BadRequestException {
    constructor() {
        super('Application is already deleted');
    }
};

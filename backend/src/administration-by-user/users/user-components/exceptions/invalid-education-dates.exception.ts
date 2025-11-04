import { BadRequestException } from "@nestjs/common";

export class InvalidEducationDatesException extends BadRequestException {
    constructor(message: string) {
        super(`Invalid education dates: ${message}`);
    }
};

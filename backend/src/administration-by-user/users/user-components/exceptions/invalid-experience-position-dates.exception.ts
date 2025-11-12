import { BadRequestException } from "@nestjs/common";

export class InvalidExperiencePositionDatesException extends BadRequestException {
    constructor(message: string) {
        super(`Invalid experience position dates: ${message}`);
    }
};

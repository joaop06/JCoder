import { BadRequestException } from "@nestjs/common";
export declare class InvalidExperiencePositionDatesException extends BadRequestException {
    constructor(message: string);
}

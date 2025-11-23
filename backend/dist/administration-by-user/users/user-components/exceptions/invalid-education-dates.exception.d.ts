import { BadRequestException } from "@nestjs/common";
export declare class InvalidEducationDatesException extends BadRequestException {
    constructor(message: string);
}

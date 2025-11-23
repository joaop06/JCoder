import { BadRequestException } from "@nestjs/common";
export declare class PasswordDoesNotMatchException extends BadRequestException {
    constructor();
}

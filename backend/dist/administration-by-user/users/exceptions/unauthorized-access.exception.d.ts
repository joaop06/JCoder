import { ForbiddenException } from "@nestjs/common";
export declare class UnauthorizedAccessException extends ForbiddenException {
    constructor();
}

import { ConflictException } from "@nestjs/common";
export declare class AlreadyExistsApplicationException extends ConflictException {
    constructor();
}

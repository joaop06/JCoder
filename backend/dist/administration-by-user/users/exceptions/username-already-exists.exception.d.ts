import { ConflictException } from "@nestjs/common";
export declare class UsernameAlreadyExistsException extends ConflictException {
    constructor();
}

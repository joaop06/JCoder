import { ForbiddenException } from "@nestjs/common";

export class UnauthorizedAccessException extends ForbiddenException {
    constructor() {
        super('You do not have permission to access this resource');
    }
};


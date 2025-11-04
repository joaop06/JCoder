import { BadRequestException } from "@nestjs/common";

export class RequiredLibraryComponentToLibraryApplication extends BadRequestException {
    constructor() {
        super('Library component are required to LIBRARY applications');
    }
};

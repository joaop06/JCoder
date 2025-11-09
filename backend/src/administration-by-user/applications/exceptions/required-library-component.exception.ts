import { BadRequestException } from "@nestjs/common";

export class RequiredLibraryComponentToLibraryApplication extends BadRequestException {
    constructor() {
        super('Library component is required for LIBRARY applications');
    }
};

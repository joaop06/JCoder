import { BadRequestException } from "@nestjs/common";

export class RequiredApiAndFrontendComponentsToFullstackApplication extends BadRequestException {
    constructor() {
        super('API and Frontend components are required for FULLSTACK applications');
    }
};

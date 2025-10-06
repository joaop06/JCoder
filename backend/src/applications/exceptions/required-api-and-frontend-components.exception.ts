import { BadRequestException } from "@nestjs/common";

export class RequiredApiAndFrontendComponentsToFullstackApplication extends BadRequestException {
    constructor() {
        super('Api and Frontend components are requireds to FULLSTACK applications');
    }
};

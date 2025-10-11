import { BadRequestException } from "@nestjs/common";

export class RequiredFrontendComponentToApiApplication extends BadRequestException {
    constructor() {
        super('Frontend component are required to Frontend applications');
    }
};

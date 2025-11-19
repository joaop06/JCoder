import { BadRequestException } from "@nestjs/common";

export class RequiredFrontendComponentToApiApplication extends BadRequestException {
    constructor() {
        super('Frontend component is required for Frontend applications');
    }
};

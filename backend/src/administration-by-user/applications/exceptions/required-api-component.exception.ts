import { BadRequestException } from "@nestjs/common";

export class RequiredApiComponentToApiApplication extends BadRequestException {
    constructor() {
        super('API component is required for API applications');
    }
};

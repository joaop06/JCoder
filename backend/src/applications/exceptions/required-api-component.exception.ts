import { BadRequestException } from "@nestjs/common";

export class RequiredApiComponentToApiApplication extends BadRequestException {
    constructor() {
        super('Api component are required to API applications');
    }
};

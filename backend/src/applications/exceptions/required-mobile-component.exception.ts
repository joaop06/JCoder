import { BadRequestException } from "@nestjs/common";

export class RequiredMobileComponentToMobileApplication extends BadRequestException {
    constructor() {
        super('Mobile component are required to MOBILE applications');
    }
};

import { BadRequestException } from "@nestjs/common";

export class RequiredMobileComponentToMobileApplication extends BadRequestException {
    constructor() {
        super('Mobile component is required for MOBILE applications');
    }
};

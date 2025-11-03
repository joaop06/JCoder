import { BadRequestException } from '@nestjs/common';

export class ComponentNotFoundException extends BadRequestException {
    constructor(componentType: string) {
        super(`${componentType} component not found`);
    }
};

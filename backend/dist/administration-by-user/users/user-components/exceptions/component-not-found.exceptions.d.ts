import { BadRequestException } from '@nestjs/common';
export declare class ComponentNotFoundException extends BadRequestException {
    constructor(componentType: string);
}

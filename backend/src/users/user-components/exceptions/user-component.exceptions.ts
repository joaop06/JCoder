import { BadRequestException } from '@nestjs/common';

export class InvalidEducationDatesException extends BadRequestException {
    constructor(message: string) {
        super(`Invalid education dates: ${message}`);
    }
}

export class InvalidExperiencePositionDatesException extends BadRequestException {
    constructor(message: string) {
        super(`Invalid experience position dates: ${message}`);
    }
}

export class ComponentNotFoundException extends BadRequestException {
    constructor(componentType: string) {
        super(`${componentType} component not found`);
    }
}


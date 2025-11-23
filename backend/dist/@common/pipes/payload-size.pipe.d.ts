import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class PayloadSizeValidationPipe implements PipeTransform {
    private readonly maxSize;
    constructor(maxSize?: number);
    transform(value: any, metadata: ArgumentMetadata): any;
}

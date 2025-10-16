import { PipeTransform, Injectable, ArgumentMetadata, PayloadTooLargeException } from '@nestjs/common';

@Injectable()
export class PayloadSizeValidationPipe implements PipeTransform {
    private readonly maxSize: number;

    constructor(maxSize: number = 10 * 1024 * 1024) { // 10MB default
        this.maxSize = maxSize;
    }

    transform(value: any, metadata: ArgumentMetadata) {
        if (metadata.type === 'body' && value) {
            const payloadSize = JSON.stringify(value).length;

            if (payloadSize > this.maxSize) {
                throw new PayloadTooLargeException(
                    `Payload size (${payloadSize} bytes) exceeds maximum allowed size (${this.maxSize} bytes)`
                );
            }
        }

        return value;
    }
}

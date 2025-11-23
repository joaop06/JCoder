import { Type, HttpException } from '@nestjs/common';
export declare function ApiExceptionResponse(exceptions: () => Type<HttpException> | Type<HttpException>[]): MethodDecorator;

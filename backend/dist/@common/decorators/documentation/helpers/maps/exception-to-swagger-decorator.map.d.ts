import { Type } from '@nestjs/common';
import { SwaggerDecoratorFactory } from '../types/swagger-decorator-factory.type';
export declare const ExceptionToSwaggerDecoratorMap: Array<{
    base: Type<any>;
    decorator: SwaggerDecoratorFactory;
    defaultDescription: string;
}>;

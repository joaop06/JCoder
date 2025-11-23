import { Type } from "@nestjs/common";
export declare function resolveSwaggerDecoratorForException(exceptionClass: Type<any>): {
    base: Type<any>;
    decorator: import("..").SwaggerDecoratorFactory;
    defaultDescription: string;
};

import { isPrototypeOf } from "./is-prototype-of";
import { InternalServerErrorException, Type } from "@nestjs/common";
import { ExceptionToSwaggerDecoratorMap } from "../maps/exception-to-swagger-decorator.map";

/**
 * Finds the corresponding Swagger decorator based on the exception's prototype string.
 */
export function resolveSwaggerDecoratorForException(exceptionClass: Type<any>) {
    // Go through the map and check if exceptionClass is an instance (via prototype) of the base
    for (const entry of ExceptionToSwaggerDecoratorMap) {
        if (isPrototypeOf(entry.base, exceptionClass)) {
            return entry;
        }
    }
    // Fallback: if no specific error was found, treat it as an InternalServerError
    return ExceptionToSwaggerDecoratorMap.find(e => e.base === InternalServerErrorException)!;
};

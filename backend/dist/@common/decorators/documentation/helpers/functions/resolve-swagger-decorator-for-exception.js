"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSwaggerDecoratorForException = resolveSwaggerDecoratorForException;
const is_prototype_of_1 = require("./is-prototype-of");
const common_1 = require("@nestjs/common");
const exception_to_swagger_decorator_map_1 = require("../maps/exception-to-swagger-decorator.map");
function resolveSwaggerDecoratorForException(exceptionClass) {
    for (const entry of exception_to_swagger_decorator_map_1.ExceptionToSwaggerDecoratorMap) {
        if ((0, is_prototype_of_1.isPrototypeOf)(entry.base, exceptionClass)) {
            return entry;
        }
    }
    return exception_to_swagger_decorator_map_1.ExceptionToSwaggerDecoratorMap.find(e => e.base === common_1.InternalServerErrorException);
}
;
//# sourceMappingURL=resolve-swagger-decorator-for-exception.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSwaggerDecoratorForException = exports.inferStatusCodeFromDescriptionMap = exports.ExceptionToSwaggerDecoratorMap = exports.extractExceptionInfo = exports.safeInstantiate = exports.StandardErrorDto = exports.isPrototypeOf = void 0;
var is_prototype_of_1 = require("./functions/is-prototype-of");
Object.defineProperty(exports, "isPrototypeOf", { enumerable: true, get: function () { return is_prototype_of_1.isPrototypeOf; } });
var standart_error_dto_1 = require("./dtos/standart-error.dto");
Object.defineProperty(exports, "StandardErrorDto", { enumerable: true, get: function () { return standart_error_dto_1.StandardErrorDto; } });
var safe_instantiate_1 = require("./functions/safe-instantiate");
Object.defineProperty(exports, "safeInstantiate", { enumerable: true, get: function () { return safe_instantiate_1.safeInstantiate; } });
var extract_exception_info_1 = require("./functions/extract-exception-info");
Object.defineProperty(exports, "extractExceptionInfo", { enumerable: true, get: function () { return extract_exception_info_1.extractExceptionInfo; } });
var exception_to_swagger_decorator_map_1 = require("./maps/exception-to-swagger-decorator.map");
Object.defineProperty(exports, "ExceptionToSwaggerDecoratorMap", { enumerable: true, get: function () { return exception_to_swagger_decorator_map_1.ExceptionToSwaggerDecoratorMap; } });
var infer_status_code_from_description_map_1 = require("./maps/infer-status-code-from-description.map");
Object.defineProperty(exports, "inferStatusCodeFromDescriptionMap", { enumerable: true, get: function () { return infer_status_code_from_description_map_1.inferStatusCodeFromDescriptionMap; } });
var resolve_swagger_decorator_for_exception_1 = require("./functions/resolve-swagger-decorator-for-exception");
Object.defineProperty(exports, "resolveSwaggerDecoratorForException", { enumerable: true, get: function () { return resolve_swagger_decorator_for_exception_1.resolveSwaggerDecoratorForException; } });
//# sourceMappingURL=index.js.map
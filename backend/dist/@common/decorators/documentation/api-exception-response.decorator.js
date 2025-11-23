"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExceptionResponse = ApiExceptionResponse;
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const helpers_1 = require("./helpers");
function ApiExceptionResponse(exceptions) {
    const list = exceptions();
    const allExceptions = Array.isArray(list) ? list : [list];
    const groupedExceptions = new Map();
    groupingExceptions(allExceptions, groupedExceptions);
    const decorators = [(0, swagger_1.ApiExtraModels)(helpers_1.StandardErrorDto)];
    for (const [status, info] of groupedExceptions.entries()) {
        decorators.push((0, swagger_1.ApiResponse)({
            status,
            description: info.description,
            content: {
                'application/json': {
                    schema: { $ref: (0, swagger_1.getSchemaPath)(helpers_1.StandardErrorDto) },
                    examples: info.examples,
                },
            },
        }));
    }
    return (0, common_1.applyDecorators)(...decorators);
}
;
function groupingExceptions(allExceptions, grouped) {
    for (const exception of allExceptions) {
        const inferred = (0, helpers_1.extractExceptionInfo)(exception);
        const { defaultDescription } = (0, helpers_1.resolveSwaggerDecoratorForException)(exception);
        const error = defaultDescription;
        const message = inferred.message ?? 'An error occurred';
        const statusCode = inferred.statusCode ?? (0, helpers_1.inferStatusCodeFromDescriptionMap)(defaultDescription);
        const exampleName = exception.name;
        const summary = inferred.message ?? defaultDescription;
        const existing = grouped.get(statusCode);
        if (!existing) {
            grouped.set(statusCode, {
                description: defaultDescription,
                examples: {
                    [exampleName]: {
                        summary,
                        value: { message, error, statusCode },
                    },
                },
            });
        }
        else {
            existing.examples[exampleName] = {
                summary,
                value: { message, error, statusCode },
            };
        }
    }
}
//# sourceMappingURL=api-exception-response.decorator.js.map
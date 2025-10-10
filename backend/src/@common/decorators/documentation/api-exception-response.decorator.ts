import {
    getSchemaPath,
    ApiExtraModels,
    ApiResponse,
} from '@nestjs/swagger';
import {
    Type,
    HttpException,
    applyDecorators,
} from '@nestjs/common';
import {
    GroupedException,
    StandardErrorDto,
    extractExceptionInfo,
    inferStatusCodeFromDescriptionMap,
    resolveSwaggerDecoratorForException,
} from './helpers';

/**
 * Decorator:
 * - Discover the base HttpException type via the prototype chain
 * - Applies the corresponding Swagger decorator
 * - Documents the standard error body (message, error, statusCode)
 */
export function ApiExceptionResponse(exceptions: () => Type<HttpException> | Type<HttpException>[]): MethodDecorator {
    const list = exceptions();
    const allExceptions = Array.isArray(list) ? list : [list];

    /**
     * Grouping exceptions by status code (string) to create ONE response per status
     */
    const groupedExceptions = new Map<
        number,
        GroupedException
    >();
    groupingExceptions(allExceptions, groupedExceptions);


    // Now we create ONE ApiResponse per status, each with multiple examples.
    const decorators: MethodDecorator[] = [ApiExtraModels(StandardErrorDto)];

    for (const [status, info] of groupedExceptions.entries()) {
        decorators.push(
            ApiResponse({
                status,
                description: info.description,
                content: {
                    'application/json': {
                        schema: { $ref: getSchemaPath(StandardErrorDto) },
                        examples: info.examples,
                    },
                },
            }),
        );
    }

    return applyDecorators(...decorators);
};

function groupingExceptions(
    allExceptions: Type<HttpException>[],
    grouped: Map<number, GroupedException>,
) {
    for (const exception of allExceptions) {
        const inferred = extractExceptionInfo(exception);
        const { defaultDescription } = resolveSwaggerDecoratorForException(exception);

        const error = defaultDescription;
        const message = inferred.message ?? 'An error occurred';
        const statusCode =
            inferred.statusCode ?? inferStatusCodeFromDescriptionMap(defaultDescription);

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
        } else {
            existing.examples[exampleName] = {
                summary,
                value: { message, error, statusCode },
            };
        }
    }
}
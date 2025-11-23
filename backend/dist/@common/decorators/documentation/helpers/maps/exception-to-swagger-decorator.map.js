"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionToSwaggerDecoratorMap = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
exports.ExceptionToSwaggerDecoratorMap = [
    { base: common_1.BadRequestException, decorator: swagger_1.ApiBadRequestResponse, defaultDescription: 'Bad Request' },
    { base: common_1.UnauthorizedException, decorator: swagger_1.ApiUnauthorizedResponse, defaultDescription: 'Unauthorized' },
    { base: common_1.ForbiddenException, decorator: swagger_1.ApiForbiddenResponse, defaultDescription: 'Forbidden' },
    { base: common_1.NotFoundException, decorator: swagger_1.ApiNotFoundResponse, defaultDescription: 'Not Found' },
    { base: common_1.MethodNotAllowedException, decorator: swagger_1.ApiMethodNotAllowedResponse, defaultDescription: 'Method Not Allowed' },
    { base: common_1.NotImplementedException, decorator: swagger_1.ApiNotImplementedResponse, defaultDescription: 'Not Implemented' },
    { base: common_1.RequestTimeoutException, decorator: swagger_1.ApiRequestTimeoutResponse, defaultDescription: 'Request Timeout' },
    { base: common_1.ConflictException, decorator: swagger_1.ApiConflictResponse, defaultDescription: 'Conflict' },
    { base: common_1.GoneException, decorator: swagger_1.ApiGoneResponse, defaultDescription: 'Gone' },
    { base: common_1.PreconditionFailedException, decorator: swagger_1.ApiPreconditionFailedResponse, defaultDescription: 'Precondition Failed' },
    { base: common_1.PayloadTooLargeException, decorator: swagger_1.ApiPayloadTooLargeResponse, defaultDescription: 'Payload Too Large' },
    { base: common_1.UnsupportedMediaTypeException, decorator: swagger_1.ApiUnsupportedMediaTypeResponse, defaultDescription: 'Unsupported Media Type' },
    { base: common_1.UnprocessableEntityException, decorator: swagger_1.ApiUnprocessableEntityResponse, defaultDescription: 'Unprocessable Entity' },
    { base: common_1.InternalServerErrorException, decorator: swagger_1.ApiInternalServerErrorResponse, defaultDescription: 'Internal Server Error' },
    { base: common_1.ServiceUnavailableException, decorator: swagger_1.ApiServiceUnavailableResponse, defaultDescription: 'Service Unavailable' },
    { base: common_1.GatewayTimeoutException, decorator: swagger_1.ApiGatewayTimeoutResponse, defaultDescription: 'Gateway Timeout' },
    { base: common_1.HttpVersionNotSupportedException, decorator: swagger_1.ApiHttpVersionNotSupportedResponse, defaultDescription: 'HTTP Version Not Supported' },
];
//# sourceMappingURL=exception-to-swagger-decorator.map.js.map
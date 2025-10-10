import {
    GoneException,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    UnauthorizedException,
    GatewayTimeoutException,
    NotImplementedException,
    RequestTimeoutException,
    PayloadTooLargeException,
    MethodNotAllowedException,
    PreconditionFailedException,
    ServiceUnavailableException,
    InternalServerErrorException,
    UnprocessableEntityException,
    UnsupportedMediaTypeException,
    HttpVersionNotSupportedException,
} from '@nestjs/common';
import {
    ApiGoneResponse,
    ApiConflictResponse,
    ApiNotFoundResponse,
    ApiForbiddenResponse,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiGatewayTimeoutResponse,
    ApiNotImplementedResponse,
    ApiRequestTimeoutResponse,
    ApiPayloadTooLargeResponse,
    ApiMethodNotAllowedResponse,
    ApiPreconditionFailedResponse,
    ApiServiceUnavailableResponse,
    ApiInternalServerErrorResponse,
    ApiUnprocessableEntityResponse,
    ApiUnsupportedMediaTypeResponse,
    ApiHttpVersionNotSupportedResponse,
} from '@nestjs/swagger';
import { Type } from '@nestjs/common';
import { SwaggerDecoratorFactory } from '../types/swagger-decorator-factory.type';

export const ExceptionToSwaggerDecoratorMap: Array<{
    base: Type<any>;
    decorator: SwaggerDecoratorFactory;
    defaultDescription: string;
}> = [
        { base: BadRequestException, decorator: ApiBadRequestResponse, defaultDescription: 'Bad Request' },
        { base: UnauthorizedException, decorator: ApiUnauthorizedResponse, defaultDescription: 'Unauthorized' },
        { base: ForbiddenException, decorator: ApiForbiddenResponse, defaultDescription: 'Forbidden' },
        { base: NotFoundException, decorator: ApiNotFoundResponse, defaultDescription: 'Not Found' },
        { base: MethodNotAllowedException, decorator: ApiMethodNotAllowedResponse, defaultDescription: 'Method Not Allowed' },
        { base: NotImplementedException, decorator: ApiNotImplementedResponse, defaultDescription: 'Not Implemented' },
        { base: RequestTimeoutException, decorator: ApiRequestTimeoutResponse, defaultDescription: 'Request Timeout' },
        { base: ConflictException, decorator: ApiConflictResponse, defaultDescription: 'Conflict' },
        { base: GoneException, decorator: ApiGoneResponse, defaultDescription: 'Gone' },
        { base: PreconditionFailedException, decorator: ApiPreconditionFailedResponse, defaultDescription: 'Precondition Failed' },
        { base: PayloadTooLargeException, decorator: ApiPayloadTooLargeResponse, defaultDescription: 'Payload Too Large' },
        { base: UnsupportedMediaTypeException, decorator: ApiUnsupportedMediaTypeResponse, defaultDescription: 'Unsupported Media Type' },
        { base: UnprocessableEntityException, decorator: ApiUnprocessableEntityResponse, defaultDescription: 'Unprocessable Entity' },
        { base: InternalServerErrorException, decorator: ApiInternalServerErrorResponse, defaultDescription: 'Internal Server Error' },
        { base: ServiceUnavailableException, decorator: ApiServiceUnavailableResponse, defaultDescription: 'Service Unavailable' },
        { base: GatewayTimeoutException, decorator: ApiGatewayTimeoutResponse, defaultDescription: 'Gateway Timeout' },
        { base: HttpVersionNotSupportedException, decorator: ApiHttpVersionNotSupportedResponse, defaultDescription: 'HTTP Version Not Supported' },
    ];

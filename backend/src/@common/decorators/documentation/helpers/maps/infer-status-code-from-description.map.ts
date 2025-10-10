/**
 * Simple inference of statusCode from the default description of the exception.
 */
export function inferStatusCodeFromDescriptionMap(defaultDescription: string): number {
    const map: Record<string, number> = {
        'Bad Request': 400,
        'Unauthorized': 401,
        'Forbidden': 403,
        'Not Found': 404,
        'Method Not Allowed': 405,
        'Not Implemented': 501,
        'Request Timeout': 408,
        'Conflict': 409,
        'Gone': 410,
        'Precondition Failed': 412,
        'Payload Too Large': 413,
        'Unsupported Media Type': 415,
        'Unprocessable Entity': 422,
        'Internal Server Error': 500,
        'Service Unavailable': 503,
        'Gateway Timeout': 504,
        'HTTP Version Not Supported': 505,
    };
    return map[defaultDescription] ?? 500;
};

import { ApiProperty } from "@nestjs/swagger";

/**
 * Standard error DTO according to the format provided:
 * {
 *   "message": "Password does not match",
 *   "error": "Bad Request",
 *   "statusCode": 400
 * }
 */
export class StandardErrorDto {
    @ApiProperty({ example: 'Password does not match' })
    message: string;

    @ApiProperty({ example: 'Bad Request' })
    error: string;

    @ApiProperty({ example: 400 })
    statusCode: number;
};

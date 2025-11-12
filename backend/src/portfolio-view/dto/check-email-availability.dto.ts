import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsBoolean, IsEmail } from "class-validator";

export class CheckEmailAvailabilityDto {
    @ApiProperty({
        example: true,
        required: true,
        type: 'boolean',
        description: 'Whether the email is available',
    })
    @IsNotEmpty()
    @IsBoolean()
    available: boolean;

    @ApiProperty({
        type: 'string',
        required: true,
        example: 'user@example.com',
        description: 'Email address to check',
    })
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;
};

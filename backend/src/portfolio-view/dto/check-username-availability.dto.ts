import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsBoolean } from "class-validator";

export class CheckUsernameAvailabilityDto {
    @ApiProperty({
        example: true,
        required: true,
        type: 'boolean',
        description: 'Whether the username is available',
    })
    @IsNotEmpty()
    @IsBoolean()
    available: boolean;

    @ApiProperty({
        type: 'string',
        required: true,
        example: 'johndoe',
        description: 'Unique username for login and portfolio URL',
    })
    @IsNotEmpty()
    @IsString()
    username: string;
};

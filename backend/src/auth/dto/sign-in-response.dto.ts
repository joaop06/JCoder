import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { User } from "../../users/entities/user.entity";

export class SignInResponseDto {
    @ApiProperty({
        type: 'string',
        required: true,
        description: 'Access token for requests',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2FvQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwiZGVsZXRlZEF0IjpudWxsLCJpYXQiOjE3NjAxMDM3OTMsImV4cCI6MTc2MDEwNzM5M30.dnSeqrKUobDcSCxztlLuWnrvJgZoYxobW-CY0rKor4U',
    })
    @IsNotEmpty()
    @IsString()
    accessToken!: string;

    @ApiProperty({
        required: true,
        type: () => User,
        description: 'Logged-in user data',
    })
    @Type(() => User)
    user!: User;
};

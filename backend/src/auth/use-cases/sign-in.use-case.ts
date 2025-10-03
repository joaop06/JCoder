import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from "@nestjs/common";
import { SignInDto } from "../dto/sign-in.dto";
import { plainToInstance } from 'class-transformer';
import { UsersService } from "../../users/users.service";
import { SignInResponseDto } from '../dto/sign-in-response.dto';
import { PasswordDoesNotMatchException } from '../exceptions/password-does-not-match.exception';

@Injectable()
export class SignInUseCase {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) { }

    async execute(signInDto: SignInDto): Promise<SignInResponseDto> {
        const user = await this.usersService.getByEmail(signInDto.email);

        const isValidPassword = await bcrypt.compare(signInDto.password, user.password);
        if (!isValidPassword) throw new PasswordDoesNotMatchException();

        const { password, ...userResponse } = user;

        return plainToInstance(SignInResponseDto, {
            accessToken: this.jwtService.sign(userResponse),
        });
    }
};

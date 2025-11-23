import { JwtService } from '@nestjs/jwt';
import { SignInDto } from "../dto/sign-in.dto";
import { UsersService } from "../../users/users.service";
import { SignInResponseDto } from '../dto/sign-in-response.dto';
export declare class SignInUseCase {
    private readonly jwtService;
    private readonly usersService;
    constructor(jwtService: JwtService, usersService: UsersService);
    execute(signInDto: SignInDto): Promise<SignInResponseDto>;
}

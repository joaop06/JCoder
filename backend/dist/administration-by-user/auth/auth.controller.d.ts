import { SignInDto } from './dto/sign-in.dto';
import { SignInUseCase } from './use-cases/sign-in.use-case';
import { SignInResponseDto } from './dto/sign-in-response.dto';
export declare class AuthController {
    private readonly signInUseCase;
    constructor(signInUseCase: SignInUseCase);
    signIn(signInDto: SignInDto): Promise<SignInResponseDto>;
}

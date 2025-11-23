import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersService } from '../../administration-by-user/users/users.service';
export declare class OwnerGuard implements CanActivate {
    private readonly usersService;
    constructor(usersService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}

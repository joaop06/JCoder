import { UsersService } from '../../users/users.service';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UnauthorizedAccessException } from '../../users/exceptions/unauthorized-access.exception';

@Injectable()
export class OwnerGuard implements CanActivate {
    constructor(private readonly usersService: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const username = request.params?.username;

        if (!user || !username) {
            throw new UnauthorizedAccessException();
        }

        // If user has username in token, compare directly
        if (user.username && user.username === username) {
            return true;
        }

        // Otherwise, verify by fetching user from database
        try {
            const userFromDb = await this.usersService.findOneBy({ username });
            if (userFromDb.id === user.id) {
                return true;
            }
        } catch {
            // User not found or error - deny access
        }

        throw new UnauthorizedAccessException();
    }
};

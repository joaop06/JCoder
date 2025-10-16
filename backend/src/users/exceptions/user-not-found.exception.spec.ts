import { UserNotFoundException } from './user-not-found.exception';
import { NotFoundException } from '@nestjs/common';

describe('UserNotFoundException', () => {
    it('should be defined', () => {
        expect(UserNotFoundException).toBeDefined();
    });

    it('should extend NotFoundException', () => {
        const exception = new UserNotFoundException();
        expect(exception).toBeInstanceOf(NotFoundException);
    });

    it('should have correct message', () => {
        const exception = new UserNotFoundException();
        expect(exception.message).toBe('User is not found');
    });

    it('should have correct status code', () => {
        const exception = new UserNotFoundException();
        expect(exception.getStatus()).toBe(404);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new UserNotFoundException();
        }).toThrow(UserNotFoundException);
    });

    it('should be throwable with correct message', () => {
        expect(() => {
            throw new UserNotFoundException();
        }).toThrow('User is not found');
    });

    it('should have correct error name', () => {
        const exception = new UserNotFoundException();
        expect(exception.name).toBe('UserNotFoundException');
    });

    it('should be serializable', () => {
        const exception = new UserNotFoundException();
        const serialized = JSON.stringify(exception);
        const parsed = JSON.parse(serialized);

        expect(parsed.message).toBe('User is not found');
        // Note: statusCode is not serialized by default, but we can verify it exists on the exception
        expect(exception.getStatus()).toBe(404);
    });

    it('should work with try-catch blocks', async () => {
        try {
            throw new UserNotFoundException();
        } catch (error) {
            expect(error).toBeInstanceOf(UserNotFoundException);
            expect((error as UserNotFoundException).message).toBe('User is not found');
            expect((error as UserNotFoundException).getStatus()).toBe(404);
        }
    });

    it('should work with async/await error handling', async () => {
        const throwError = async () => {
            throw new UserNotFoundException();
        };

        await expect(throwError()).rejects.toThrow(UserNotFoundException);
        await expect(throwError()).rejects.toThrow('User is not found');
    });

    it('should maintain stack trace', () => {
        const exception = new UserNotFoundException();
        expect(exception.stack).toBeDefined();
        expect(typeof exception.stack).toBe('string');
        expect(exception.stack).toContain('UserNotFoundException');
    });
});

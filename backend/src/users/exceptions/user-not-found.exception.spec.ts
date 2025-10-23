import { UserNotFoundException } from './user-not-found.exception';
import { NotFoundException } from '@nestjs/common';

describe('UserNotFoundException', () => {
    it('should be defined', () => {
        expect(UserNotFoundException).toBeDefined();
    });

    it('should be an instance of NotFoundException', () => {
        const exception = new UserNotFoundException();
        expect(exception).toBeInstanceOf(NotFoundException);
    });

    it('should be an instance of UserNotFoundException', () => {
        const exception = new UserNotFoundException();
        expect(exception).toBeInstanceOf(UserNotFoundException);
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

    it('should have correct name', () => {
        const exception = new UserNotFoundException();
        expect(exception.name).toBe('UserNotFoundException');
    });

    it('should be serializable', () => {
        const exception = new UserNotFoundException();
        const serialized = JSON.stringify(exception);
        expect(serialized).toContain('User is not found');
    });

    it('should maintain message consistency across multiple instances', () => {
        const exception1 = new UserNotFoundException();
        const exception2 = new UserNotFoundException();

        expect(exception1.message).toBe(exception2.message);
        expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should work in try-catch blocks', () => {
        try {
            throw new UserNotFoundException();
        } catch (error) {
            expect(error).toBeInstanceOf(UserNotFoundException);
            expect(error.message).toBe('User is not found');
            expect(error.getStatus()).toBe(404);
        }
    });

    it('should be distinguishable from other exceptions', () => {
        const exception = new UserNotFoundException();
        expect(exception.name).not.toBe('ApplicationNotFoundException');
        expect(exception.name).not.toBe('AlreadyExistsApplicationException');
        expect(exception.message).not.toBe('Application is not found');
        expect(exception.message).not.toBe('Already exists a Application with this name');
    });

    it('should have 404 status code (Not Found)', () => {
        const exception = new UserNotFoundException();
        expect(exception.getStatus()).toBe(404);
    });

    it('should be catchable by generic Error handler', () => {
        expect(() => {
            throw new UserNotFoundException();
        }).toThrow(Error);
    });

    it('should be catchable by NotFoundException handler', () => {
        expect(() => {
            throw new UserNotFoundException();
        }).toThrow(NotFoundException);
    });

    it('should have proper inheritance chain', () => {
        const exception = new UserNotFoundException();
        expect(exception).toBeInstanceOf(Error);
        expect(exception).toBeInstanceOf(NotFoundException);
        expect(exception).toBeInstanceOf(UserNotFoundException);
    });

    it('should maintain stack trace when thrown', () => {
        let caughtException: UserNotFoundException;

        try {
            throw new UserNotFoundException();
        } catch (error) {
            caughtException = error as UserNotFoundException;
        }

        expect(caughtException).toBeDefined();
        expect(caughtException.stack).toBeDefined();
        expect(caughtException.stack).toContain('UserNotFoundException');
    });

    it('should be usable in async/await context', async () => {
        const asyncFunction = async () => {
            throw new UserNotFoundException();
        };

        await expect(asyncFunction()).rejects.toThrow(UserNotFoundException);
        await expect(asyncFunction()).rejects.toThrow('User is not found');
    });

    it('should be usable in Promise context', () => {
        const promiseFunction = () => {
            return new Promise((resolve, reject) => {
                reject(new UserNotFoundException());
            });
        };

        return expect(promiseFunction()).rejects.toThrow(UserNotFoundException);
    });
});

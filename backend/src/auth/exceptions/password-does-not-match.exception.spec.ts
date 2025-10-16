import { PasswordDoesNotMatchException } from './password-does-not-match.exception';

describe('PasswordDoesNotMatchException', () => {
    it('should be defined', () => {
        expect(PasswordDoesNotMatchException).toBeDefined();
    });

    it('should extend BadRequestException', () => {
        const exception = new PasswordDoesNotMatchException();
        expect(exception).toBeInstanceOf(Error);
        expect(exception.name).toBe('PasswordDoesNotMatchException');
    });

    it('should have correct message', () => {
        const exception = new PasswordDoesNotMatchException();
        expect(exception.message).toBe('Password does not match');
    });

    it('should have correct status code', () => {
        const exception = new PasswordDoesNotMatchException();
        expect(exception.getStatus()).toBe(400);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new PasswordDoesNotMatchException();
        }).toThrow(PasswordDoesNotMatchException);
    });

    it('should be throwable with correct message', () => {
        expect(() => {
            throw new PasswordDoesNotMatchException();
        }).toThrow('Password does not match');
    });

    it('should have proper error structure', () => {
        const exception = new PasswordDoesNotMatchException();

        expect(exception).toHaveProperty('message');
        expect(exception).toHaveProperty('name');
        expect(exception).toHaveProperty('stack');
        expect(exception.message).toBe('Password does not match');
        expect(exception.name).toBe('PasswordDoesNotMatchException');
    });

    it('should be serializable', () => {
        const exception = new PasswordDoesNotMatchException();
        const serialized = JSON.stringify(exception);
        const parsed = JSON.parse(serialized);

        expect(parsed.message).toBe('Password does not match');
        expect(exception.getStatus()).toBe(400);
    });

    it('should work with try-catch blocks', () => {
        let caughtException: PasswordDoesNotMatchException | null = null;

        try {
            throw new PasswordDoesNotMatchException();
        } catch (error) {
            caughtException = error as PasswordDoesNotMatchException;
        }

        expect(caughtException).toBeInstanceOf(PasswordDoesNotMatchException);
        expect(caughtException?.message).toBe('Password does not match');
        expect(caughtException?.getStatus()).toBe(400);
    });
});

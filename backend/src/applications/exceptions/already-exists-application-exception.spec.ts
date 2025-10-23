import { AlreadyExistsApplicationException } from './already-exists-application-exception';

describe('AlreadyExistsApplicationException', () => {
    it('should be defined', () => {
        expect(AlreadyExistsApplicationException).toBeDefined();
    });

    it('should be an instance of ConflictException', () => {
        const exception = new AlreadyExistsApplicationException();
        expect(exception).toBeInstanceOf(AlreadyExistsApplicationException);
    });

    it('should have correct message', () => {
        const exception = new AlreadyExistsApplicationException();
        expect(exception.message).toBe('Already exists a Application with this name');
    });

    it('should have correct status code', () => {
        const exception = new AlreadyExistsApplicationException();
        expect(exception.getStatus()).toBe(409);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new AlreadyExistsApplicationException();
        }).toThrow(AlreadyExistsApplicationException);
    });

    it('should be throwable with correct message', () => {
        expect(() => {
            throw new AlreadyExistsApplicationException();
        }).toThrow('Already exists a Application with this name');
    });

    it('should have correct name', () => {
        const exception = new AlreadyExistsApplicationException();
        expect(exception.name).toBe('AlreadyExistsApplicationException');
    });

    it('should be serializable', () => {
        const exception = new AlreadyExistsApplicationException();
        const serialized = JSON.stringify(exception);
        expect(serialized).toContain('Already exists a Application with this name');
    });

    it('should maintain message consistency across multiple instances', () => {
        const exception1 = new AlreadyExistsApplicationException();
        const exception2 = new AlreadyExistsApplicationException();

        expect(exception1.message).toBe(exception2.message);
        expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should work in try-catch blocks', () => {
        try {
            throw new AlreadyExistsApplicationException();
        } catch (error) {
            expect(error).toBeInstanceOf(AlreadyExistsApplicationException);
            expect(error.message).toBe('Already exists a Application with this name');
            expect(error.getStatus()).toBe(409);
        }
    });

    it('should be distinguishable from other exceptions', () => {
        const exception = new AlreadyExistsApplicationException();
        expect(exception.name).not.toBe('ApplicationNotFoundException');
        expect(exception.message).not.toBe('Application is not found');
        expect(exception.getStatus()).not.toBe(404);
    });

    it('should have conflict status code (409)', () => {
        const exception = new AlreadyExistsApplicationException();
        expect(exception.getStatus()).toBe(409);
    });
});

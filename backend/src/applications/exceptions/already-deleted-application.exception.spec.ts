import { AlreadyDeletedApplicationException } from './already-deleted-application.exception';

describe('AlreadyDeletedApplicationException', () => {
    it('should be defined', () => {
        expect(AlreadyDeletedApplicationException).toBeDefined();
    });

    it('should be an instance of BadRequestException', () => {
        const exception = new AlreadyDeletedApplicationException();
        expect(exception).toBeInstanceOf(AlreadyDeletedApplicationException);
    });

    it('should have correct message', () => {
        const exception = new AlreadyDeletedApplicationException();
        expect(exception.message).toBe('Application is already deleted');
    });

    it('should have correct status code', () => {
        const exception = new AlreadyDeletedApplicationException();
        expect(exception.getStatus()).toBe(400);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new AlreadyDeletedApplicationException();
        }).toThrow(AlreadyDeletedApplicationException);
    });

    it('should be throwable with correct message', () => {
        expect(() => {
            throw new AlreadyDeletedApplicationException();
        }).toThrow('Application is already deleted');
    });

    it('should have correct name', () => {
        const exception = new AlreadyDeletedApplicationException();
        expect(exception.name).toBe('AlreadyDeletedApplicationException');
    });

    it('should be serializable', () => {
        const exception = new AlreadyDeletedApplicationException();
        const serialized = JSON.stringify(exception);
        expect(serialized).toContain('Application is already deleted');
    });

    it('should maintain message consistency across multiple instances', () => {
        const exception1 = new AlreadyDeletedApplicationException();
        const exception2 = new AlreadyDeletedApplicationException();

        expect(exception1.message).toBe(exception2.message);
        expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should work in try-catch blocks', () => {
        try {
            throw new AlreadyDeletedApplicationException();
        } catch (error) {
            expect(error).toBeInstanceOf(AlreadyDeletedApplicationException);
            expect(error.message).toBe('Application is already deleted');
            expect(error.getStatus()).toBe(400);
        }
    });

    it('should be distinguishable from other exceptions', () => {
        const exception = new AlreadyDeletedApplicationException();
        expect(exception.name).not.toBe('ApplicationNotFoundException');
        expect(exception.message).not.toBe('Application is not found');
    });
});

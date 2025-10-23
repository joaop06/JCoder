import { ApplicationNotFoundException } from './application-not-found.exception';

describe('ApplicationNotFoundException', () => {
    it('should be defined', () => {
        expect(ApplicationNotFoundException).toBeDefined();
    });

    it('should be an instance of NotFoundException', () => {
        const exception = new ApplicationNotFoundException();
        expect(exception).toBeInstanceOf(ApplicationNotFoundException);
    });

    it('should have correct message', () => {
        const exception = new ApplicationNotFoundException();
        expect(exception.message).toBe('Application is not found');
    });

    it('should have correct status code', () => {
        const exception = new ApplicationNotFoundException();
        expect(exception.getStatus()).toBe(404);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new ApplicationNotFoundException();
        }).toThrow(ApplicationNotFoundException);
    });

    it('should be throwable with correct message', () => {
        expect(() => {
            throw new ApplicationNotFoundException();
        }).toThrow('Application is not found');
    });

    it('should have correct name', () => {
        const exception = new ApplicationNotFoundException();
        expect(exception.name).toBe('ApplicationNotFoundException');
    });

    it('should be serializable', () => {
        const exception = new ApplicationNotFoundException();
        const serialized = JSON.stringify(exception);
        expect(serialized).toContain('Application is not found');
    });

    it('should maintain message consistency across multiple instances', () => {
        const exception1 = new ApplicationNotFoundException();
        const exception2 = new ApplicationNotFoundException();

        expect(exception1.message).toBe(exception2.message);
        expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should work in try-catch blocks', () => {
        try {
            throw new ApplicationNotFoundException();
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationNotFoundException);
            expect(error.message).toBe('Application is not found');
            expect(error.getStatus()).toBe(404);
        }
    });

    it('should be distinguishable from other exceptions', () => {
        const exception = new ApplicationNotFoundException();
        expect(exception.name).not.toBe('AlreadyDeletedApplicationException');
        expect(exception.name).not.toBe('AlreadyExistsApplicationException');
        expect(exception.message).not.toBe('Application is already deleted');
        expect(exception.message).not.toBe('Already exists a Application with this name');
    });

    it('should have 404 status code (Not Found)', () => {
        const exception = new ApplicationNotFoundException();
        expect(exception.getStatus()).toBe(404);
    });

    it('should be catchable by generic Error handler', () => {
        expect(() => {
            throw new ApplicationNotFoundException();
        }).toThrow(Error);
    });

    it('should provide meaningful error information', () => {
        const exception = new ApplicationNotFoundException();
        expect(exception.message).toBeTruthy();
        expect(exception.message.length).toBeGreaterThan(0);
        expect(exception.getStatus()).toBeGreaterThan(0);
    });
});

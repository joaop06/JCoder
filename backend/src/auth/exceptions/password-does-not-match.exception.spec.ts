import { PasswordDoesNotMatchException } from './password-does-not-match.exception';
import { BadRequestException } from '@nestjs/common';

describe('PasswordDoesNotMatchException', () => {
    it('should be defined', () => {
        expect(PasswordDoesNotMatchException).toBeDefined();
    });

    it('should be an instance of BadRequestException', () => {
        const exception = new PasswordDoesNotMatchException();
        expect(exception).toBeInstanceOf(BadRequestException);
    });

    it('should be an instance of PasswordDoesNotMatchException', () => {
        const exception = new PasswordDoesNotMatchException();
        expect(exception).toBeInstanceOf(PasswordDoesNotMatchException);
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

    it('should have correct name', () => {
        const exception = new PasswordDoesNotMatchException();
        expect(exception.name).toBe('PasswordDoesNotMatchException');
    });

    it('should be serializable', () => {
        const exception = new PasswordDoesNotMatchException();
        const serialized = JSON.stringify(exception);
        expect(serialized).toContain('Password does not match');
    });

    it('should maintain message consistency across multiple instances', () => {
        const exception1 = new PasswordDoesNotMatchException();
        const exception2 = new PasswordDoesNotMatchException();

        expect(exception1.message).toBe(exception2.message);
        expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should work in try-catch blocks', () => {
        try {
            throw new PasswordDoesNotMatchException();
        } catch (error) {
            expect(error).toBeInstanceOf(PasswordDoesNotMatchException);
            expect(error.message).toBe('Password does not match');
            expect(error.getStatus()).toBe(400);
        }
    });

    it('should be distinguishable from other exceptions', () => {
        const exception = new PasswordDoesNotMatchException();
        expect(exception.name).not.toBe('ApplicationNotFoundException');
        expect(exception.name).not.toBe('AlreadyExistsApplicationException');
        expect(exception.message).not.toBe('Application is not found');
        expect(exception.message).not.toBe('Already exists a Application with this name');
    });

    it('should have 400 status code (Bad Request)', () => {
        const exception = new PasswordDoesNotMatchException();
        expect(exception.getStatus()).toBe(400);
    });

    it('should be catchable by generic Error handler', () => {
        expect(() => {
            throw new PasswordDoesNotMatchException();
        }).toThrow(Error);
    });

    it('should be catchable by BadRequestException handler', () => {
        expect(() => {
            throw new PasswordDoesNotMatchException();
        }).toThrow(BadRequestException);
    });

    it('should provide meaningful error information', () => {
        const exception = new PasswordDoesNotMatchException();
        expect(exception.message).toBeTruthy();
        expect(exception.message.length).toBeGreaterThan(0);
        expect(exception.getStatus()).toBeGreaterThan(0);
    });

    it('should inherit from BadRequestException properties', () => {
        const exception = new PasswordDoesNotMatchException();
        expect(exception.getResponse()).toBeDefined();
        expect(exception.getStatus()).toBe(400);
    });

    it('should have consistent constructor behavior', () => {
        const exception1 = new PasswordDoesNotMatchException();
        const exception2 = new PasswordDoesNotMatchException();

        expect(exception1.constructor).toBe(exception2.constructor);
        expect(exception1.message).toBe(exception2.message);
        expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should be usable in authentication error handling scenarios', () => {
        const simulatePasswordMismatch = () => {
            throw new PasswordDoesNotMatchException();
        };

        expect(simulatePasswordMismatch).toThrow(PasswordDoesNotMatchException);
        expect(simulatePasswordMismatch).toThrow('Password does not match');
    });
});

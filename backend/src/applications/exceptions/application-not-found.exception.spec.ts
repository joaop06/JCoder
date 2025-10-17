import { ApplicationNotFoundException } from './application-not-found.exception';
import { NotFoundException } from '@nestjs/common';

describe('ApplicationNotFoundException', () => {
    it('should be defined', () => {
        expect(ApplicationNotFoundException).toBeDefined();
    });

    it('should extend NotFoundException', () => {
        const exception = new ApplicationNotFoundException();
        expect(exception).toBeInstanceOf(NotFoundException);
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

    it('should be catchable', () => {
        try {
            throw new ApplicationNotFoundException();
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationNotFoundException);
            expect((error as any).message).toBe('Application is not found');
            expect((error as any).getStatus()).toBe(404);
        }
    });

    it('should have correct name', () => {
        const exception = new ApplicationNotFoundException();
        expect(exception.name).toBe('ApplicationNotFoundException');
    });

    it('should be serializable', () => {
        const exception = new ApplicationNotFoundException();
        const serialized = JSON.stringify(exception);
        const parsed = JSON.parse(serialized);

        expect(parsed.message).toBe('Application is not found');
        expect((exception as any).getStatus()).toBe(404);
    });
});

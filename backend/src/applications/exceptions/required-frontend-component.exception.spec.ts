import { RequiredFrontendComponentToApiApplication } from './required-frontend-component.exception';

describe('RequiredFrontendComponentToApiApplication', () => {
    it('should be defined', () => {
        expect(RequiredFrontendComponentToApiApplication).toBeDefined();
    });

    it('should be an instance of BadRequestException', () => {
        const exception = new RequiredFrontendComponentToApiApplication();
        expect(exception).toBeInstanceOf(RequiredFrontendComponentToApiApplication);
    });

    it('should have correct message', () => {
        const exception = new RequiredFrontendComponentToApiApplication();
        expect(exception.message).toBe('Frontend component are required to Frontend applications');
    });

    it('should have correct status code', () => {
        const exception = new RequiredFrontendComponentToApiApplication();
        expect(exception.getStatus()).toBe(400);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new RequiredFrontendComponentToApiApplication();
        }).toThrow(RequiredFrontendComponentToApiApplication);
    });

    it('should be throwable with correct message', () => {
        expect(() => {
            throw new RequiredFrontendComponentToApiApplication();
        }).toThrow('Frontend component are required to Frontend applications');
    });

    it('should have correct name', () => {
        const exception = new RequiredFrontendComponentToApiApplication();
        expect(exception.name).toBe('RequiredFrontendComponentToApiApplication');
    });

    it('should be serializable', () => {
        const exception = new RequiredFrontendComponentToApiApplication();
        const serialized = JSON.stringify(exception);
        expect(serialized).toContain('Frontend component are required to Frontend applications');
    });

    it('should maintain message consistency across multiple instances', () => {
        const exception1 = new RequiredFrontendComponentToApiApplication();
        const exception2 = new RequiredFrontendComponentToApiApplication();

        expect(exception1.message).toBe(exception2.message);
        expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should work in try-catch blocks', () => {
        try {
            throw new RequiredFrontendComponentToApiApplication();
        } catch (error) {
            expect(error).toBeInstanceOf(RequiredFrontendComponentToApiApplication);
            expect(error.message).toBe('Frontend component are required to Frontend applications');
            expect(error.getStatus()).toBe(400);
        }
    });
});

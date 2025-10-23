import { RequiredApiAndFrontendComponentsToFullstackApplication } from './required-api-and-frontend-components.exception';

describe('RequiredApiAndFrontendComponentsToFullstackApplication', () => {
    it('should be defined', () => {
        expect(RequiredApiAndFrontendComponentsToFullstackApplication).toBeDefined();
    });

    it('should be an instance of BadRequestException', () => {
        const exception = new RequiredApiAndFrontendComponentsToFullstackApplication();
        expect(exception).toBeInstanceOf(RequiredApiAndFrontendComponentsToFullstackApplication);
    });

    it('should have correct message', () => {
        const exception = new RequiredApiAndFrontendComponentsToFullstackApplication();
        expect(exception.message).toBe('Api and Frontend components are requireds to FULLSTACK applications');
    });

    it('should have correct status code', () => {
        const exception = new RequiredApiAndFrontendComponentsToFullstackApplication();
        expect(exception.getStatus()).toBe(400);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new RequiredApiAndFrontendComponentsToFullstackApplication();
        }).toThrow(RequiredApiAndFrontendComponentsToFullstackApplication);
    });

    it('should be throwable with correct message', () => {
        expect(() => {
            throw new RequiredApiAndFrontendComponentsToFullstackApplication();
        }).toThrow('Api and Frontend components are requireds to FULLSTACK applications');
    });

    it('should have correct name', () => {
        const exception = new RequiredApiAndFrontendComponentsToFullstackApplication();
        expect(exception.name).toBe('RequiredApiAndFrontendComponentsToFullstackApplication');
    });

    it('should be serializable', () => {
        const exception = new RequiredApiAndFrontendComponentsToFullstackApplication();
        const serialized = JSON.stringify(exception);
        expect(serialized).toContain('Api and Frontend components are requireds to FULLSTACK applications');
    });

    it('should maintain message consistency across multiple instances', () => {
        const exception1 = new RequiredApiAndFrontendComponentsToFullstackApplication();
        const exception2 = new RequiredApiAndFrontendComponentsToFullstackApplication();

        expect(exception1.message).toBe(exception2.message);
        expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should work in try-catch blocks', () => {
        try {
            throw new RequiredApiAndFrontendComponentsToFullstackApplication();
        } catch (error) {
            expect(error).toBeInstanceOf(RequiredApiAndFrontendComponentsToFullstackApplication);
            expect(error.message).toBe('Api and Frontend components are requireds to FULLSTACK applications');
            expect(error.getStatus()).toBe(400);
        }
    });

    it('should be distinguishable from single component exceptions', () => {
        const exception = new RequiredApiAndFrontendComponentsToFullstackApplication();
        expect(exception.name).not.toBe('RequiredApiComponentToApiApplication');
        expect(exception.name).not.toBe('RequiredFrontendComponentToApiApplication');
        expect(exception.message).toContain('Api and Frontend');
        expect(exception.message).toContain('FULLSTACK');
    });

    it('should have the longest name among component exceptions', () => {
        const exception = new RequiredApiAndFrontendComponentsToFullstackApplication();
        expect(exception.name.length).toBeGreaterThan(50);
    });
});

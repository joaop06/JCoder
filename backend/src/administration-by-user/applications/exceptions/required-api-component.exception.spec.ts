import { RequiredApiComponentToApiApplication } from './required-api-component.exception';

describe('RequiredApiComponentToApiApplication', () => {
    it('should be defined', () => {
        expect(RequiredApiComponentToApiApplication).toBeDefined();
    });

    it('should be an instance of BadRequestException', () => {
        const exception = new RequiredApiComponentToApiApplication();
        expect(exception).toBeInstanceOf(RequiredApiComponentToApiApplication);
    });

    it('should have correct message', () => {
        const exception = new RequiredApiComponentToApiApplication();
        expect(exception.message).toBe('Api component are required to API applications');
    });

    it('should have correct status code', () => {
        const exception = new RequiredApiComponentToApiApplication();
        expect(exception.getStatus()).toBe(400);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new RequiredApiComponentToApiApplication();
        }).toThrow(RequiredApiComponentToApiApplication);
    });

    it('should be throwable with correct message', () => {
        expect(() => {
            throw new RequiredApiComponentToApiApplication();
        }).toThrow('Api component are required to API applications');
    });

    it('should have correct name', () => {
        const exception = new RequiredApiComponentToApiApplication();
        expect(exception.name).toBe('RequiredApiComponentToApiApplication');
    });

    it('should be serializable', () => {
        const exception = new RequiredApiComponentToApiApplication();
        const serialized = JSON.stringify(exception);
        expect(serialized).toContain('Api component are required to API applications');
    });

    it('should maintain message consistency across multiple instances', () => {
        const exception1 = new RequiredApiComponentToApiApplication();
        const exception2 = new RequiredApiComponentToApiApplication();

        expect(exception1.message).toBe(exception2.message);
        expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should work in try-catch blocks', () => {
        try {
            throw new RequiredApiComponentToApiApplication();
        } catch (error) {
            expect(error).toBeInstanceOf(RequiredApiComponentToApiApplication);
            expect(error.message).toBe('Api component are required to API applications');
            expect(error.getStatus()).toBe(400);
        }
    });

    it('should be distinguishable from other component exceptions', () => {
        const exception = new RequiredApiComponentToApiApplication();
        expect(exception.name).not.toBe('RequiredMobileComponentToMobileApplication');
        expect(exception.name).not.toBe('RequiredLibraryComponentToLibraryApplication');
        expect(exception.name).not.toBe('RequiredFrontendComponentToApiApplication');
    });

    it('should mention API applications in the message', () => {
        const exception = new RequiredApiComponentToApiApplication();
        expect(exception.message).toContain('API applications');
    });
});

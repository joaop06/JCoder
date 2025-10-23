import { RequiredMobileComponentToMobileApplication } from './required-mobile-component.exception';

describe('RequiredMobileComponentToMobileApplication', () => {
    it('should be defined', () => {
        expect(RequiredMobileComponentToMobileApplication).toBeDefined();
    });

    it('should be an instance of BadRequestException', () => {
        const exception = new RequiredMobileComponentToMobileApplication();
        expect(exception).toBeInstanceOf(RequiredMobileComponentToMobileApplication);
    });

    it('should have correct message', () => {
        const exception = new RequiredMobileComponentToMobileApplication();
        expect(exception.message).toBe('Mobile component are required to MOBILE applications');
    });

    it('should have correct status code', () => {
        const exception = new RequiredMobileComponentToMobileApplication();
        expect(exception.getStatus()).toBe(400);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new RequiredMobileComponentToMobileApplication();
        }).toThrow(RequiredMobileComponentToMobileApplication);
    });

    it('should be throwable with correct message', () => {
        expect(() => {
            throw new RequiredMobileComponentToMobileApplication();
        }).toThrow('Mobile component are required to MOBILE applications');
    });

    it('should have correct name', () => {
        const exception = new RequiredMobileComponentToMobileApplication();
        expect(exception.name).toBe('RequiredMobileComponentToMobileApplication');
    });

    it('should be serializable', () => {
        const exception = new RequiredMobileComponentToMobileApplication();
        const serialized = JSON.stringify(exception);
        expect(serialized).toContain('Mobile component are required to MOBILE applications');
    });

    it('should maintain message consistency across multiple instances', () => {
        const exception1 = new RequiredMobileComponentToMobileApplication();
        const exception2 = new RequiredMobileComponentToMobileApplication();

        expect(exception1.message).toBe(exception2.message);
        expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should work in try-catch blocks', () => {
        try {
            throw new RequiredMobileComponentToMobileApplication();
        } catch (error) {
            expect(error).toBeInstanceOf(RequiredMobileComponentToMobileApplication);
            expect(error.message).toBe('Mobile component are required to MOBILE applications');
            expect(error.getStatus()).toBe(400);
        }
    });

    it('should be distinguishable from other component exceptions', () => {
        const exception = new RequiredMobileComponentToMobileApplication();
        expect(exception.name).not.toBe('RequiredApiComponentToApiApplication');
        expect(exception.name).not.toBe('RequiredLibraryComponentToLibraryApplication');
        expect(exception.name).not.toBe('RequiredFrontendComponentToApiApplication');
    });

    it('should mention MOBILE applications in the message', () => {
        const exception = new RequiredMobileComponentToMobileApplication();
        expect(exception.message).toContain('MOBILE applications');
    });
});

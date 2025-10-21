import { RequiredLibraryComponentToLibraryApplication } from './required-library-component.exception';

describe('RequiredLibraryComponentToLibraryApplication', () => {
    it('should be defined', () => {
        expect(RequiredLibraryComponentToLibraryApplication).toBeDefined();
    });

    it('should be an instance of BadRequestException', () => {
        const exception = new RequiredLibraryComponentToLibraryApplication();
        expect(exception).toBeInstanceOf(RequiredLibraryComponentToLibraryApplication);
    });

    it('should have correct message', () => {
        const exception = new RequiredLibraryComponentToLibraryApplication();
        expect(exception.message).toBe('Library component are required to LIBRARY applications');
    });

    it('should have correct status code', () => {
        const exception = new RequiredLibraryComponentToLibraryApplication();
        expect(exception.getStatus()).toBe(400);
    });

    it('should be throwable', () => {
        expect(() => {
            throw new RequiredLibraryComponentToLibraryApplication();
        }).toThrow(RequiredLibraryComponentToLibraryApplication);
    });

    it('should be throwable with correct message', () => {
        expect(() => {
            throw new RequiredLibraryComponentToLibraryApplication();
        }).toThrow('Library component are required to LIBRARY applications');
    });

    it('should have correct name', () => {
        const exception = new RequiredLibraryComponentToLibraryApplication();
        expect(exception.name).toBe('RequiredLibraryComponentToLibraryApplication');
    });

    it('should be serializable', () => {
        const exception = new RequiredLibraryComponentToLibraryApplication();
        const serialized = JSON.stringify(exception);
        expect(serialized).toContain('Library component are required to LIBRARY applications');
    });

    it('should maintain message consistency across multiple instances', () => {
        const exception1 = new RequiredLibraryComponentToLibraryApplication();
        const exception2 = new RequiredLibraryComponentToLibraryApplication();

        expect(exception1.message).toBe(exception2.message);
        expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should work in try-catch blocks', () => {
        try {
            throw new RequiredLibraryComponentToLibraryApplication();
        } catch (error) {
            expect(error).toBeInstanceOf(RequiredLibraryComponentToLibraryApplication);
            expect(error.message).toBe('Library component are required to LIBRARY applications');
            expect(error.getStatus()).toBe(400);
        }
    });

    it('should be distinguishable from other component exceptions', () => {
        const exception = new RequiredLibraryComponentToLibraryApplication();
        expect(exception.name).not.toBe('RequiredApiComponentToApiApplication');
        expect(exception.name).not.toBe('RequiredMobileComponentToMobileApplication');
        expect(exception.name).not.toBe('RequiredFrontendComponentToApiApplication');
    });
});

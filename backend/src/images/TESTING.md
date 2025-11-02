# Testing Guide for Images Module

This guide explains how to test the refactored Images Module.

## Test Structure

The test files need to be updated to reflect the new architecture:

### Files to Update

1. `images.service.integration.spec.ts` - Legacy service tests (can be deprecated)
2. `images.module.integration.spec.ts` - Module integration tests
3. `image-upload.service.integration.spec.ts` - Upload service tests (old, needs refactor)
4. Individual use-case test files in `use-cases/` directory

### New Test Files Needed

1. `image-storage.service.spec.ts` - Unit tests for ImageStorageService
2. `image-storage.service.integration.spec.ts` - Integration tests for ImageStorageService

## Testing Strategy

### Unit Tests

Each use case should have unit tests that mock dependencies:

```typescript
describe('UploadUserProfileImageUseCase', () => {
    let useCase: UploadUserProfileImageUseCase;
    let userRepository: Repository<User>;
    let imageStorageService: ImageStorageService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UploadUserProfileImageUseCase,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: ImageStorageService,
                    useValue: {
                        uploadImage: jest.fn(),
                        deleteImage: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get(UploadUserProfileImageUseCase);
        userRepository = module.get(getRepositoryToken(User));
        imageStorageService = module.get(ImageStorageService);
    });

    it('should upload profile image successfully', async () => {
        // Test implementation
    });
});
```

### Integration Tests

Integration tests should test the full flow with a real database:

```typescript
describe('ImagesModule Integration', () => {
    let app: INestApplication;
    let imageStorageService: ImageStorageService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [ImagesModule, TypeOrmModule.forRoot(testConfig)],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        
        imageStorageService = app.get(ImageStorageService);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Image Upload', () => {
        it('should upload and retrieve an image', async () => {
            // Test implementation
        });
    });
});
```

## Mocking File Uploads

Use this helper to create mock file uploads:

```typescript
function createMockFile(
    mimetype: string = 'image/jpeg',
    size: number = 1024 * 1024,
): Express.Multer.File {
    return {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype,
        size,
        buffer: Buffer.from('fake-image-data'),
        stream: null,
        destination: '',
        filename: '',
        path: '',
    } as Express.Multer.File;
}
```

## Testing Checklist

- [ ] Update ImageStorageService tests
- [ ] Update application image use-case tests
- [ ] Update technology image use-case tests  
- [ ] Create user image use-case tests
- [ ] Update images controller tests
- [ ] Update integration tests
- [ ] Test error scenarios
- [ ] Test file validation
- [ ] Test image processing
- [ ] Test cleanup operations

## Running Tests

```bash
# Run all images module tests
npm test -- images

# Run specific test file
npm test -- images.service.spec.ts

# Run with coverage
npm test -- --coverage images

# Run in watch mode
npm test -- --watch images
```

## Test Coverage Goals

- Unit tests: > 80%
- Integration tests: > 70%
- E2E tests: Critical paths covered

## Common Test Scenarios

### 1. Upload Success
- Valid file upload
- Image processing
- Database update
- File system verification

### 2. Upload Failure
- Invalid file type
- File too large
- Entity not found
- Disk full

### 3. Delete Success
- File exists and is deleted
- Database is updated
- Cleanup empty directories

### 4. Delete Failure
- File doesn't exist (graceful handling)
- Entity not found

### 5. Retrieve Success
- File exists and is returned
- Correct MIME type
- Cache headers set

### 6. Retrieve Failure
- File not found
- Entity has no image

## Debugging Tests

Enable debug logging in tests:

```typescript
process.env.DEBUG = 'images:*';
```

Check file system after tests:

```typescript
afterEach(async () => {
    const uploadPath = './test-uploads';
    // Verify or clean up
});
```

## TODO for Tests

Since the refactoring is extensive, tests should be updated incrementally:

1. Priority 1: Core ImageStorageService tests
2. Priority 2: Critical use-case tests (upload, delete, get)
3. Priority 3: Controller integration tests
4. Priority 4: Edge cases and error scenarios
5. Priority 5: Performance tests

## Notes

- Tests may need to be run sequentially due to file system operations
- Use separate upload directories for tests
- Clean up test files after each test
- Mock external dependencies (Sharp, file system) for unit tests
- Use real file system for integration tests


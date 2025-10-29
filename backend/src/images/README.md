# Images Module

This module centralizes all image manipulation operations across the application. It provides a generic, flexible architecture for handling image uploads, processing, storage, and retrieval for any resource type.

## Architecture Overview

The Images Module follows a clean architecture pattern with clear separation of concerns:

```
images/
├── enums/               # Enumerations for resource and image types
├── types/               # TypeScript interfaces and configurations
├── services/            # Core business logic services
├── use-cases/           # Application-specific use cases
├── images.controller.ts # HTTP endpoints
├── images.module.ts     # Module configuration
└── images.service.ts    # Legacy service (to be deprecated)
```

## Core Components

### 1. ImageStorageService

The `ImageStorageService` is the heart of the module. It provides generic methods for:
- Image upload with automatic processing (resize, compression, format conversion)
- Image retrieval with path validation
- Image deletion with cleanup
- Support for multiple resource types (applications, technologies, users)
- Resource-specific configurations

**Key Features:**
- Automatic image optimization using Sharp
- Configurable quality, size, and format per resource type
- Support for subdirectories (e.g., user components)
- Atomic file operations
- Graceful error handling

### 2. Resource Types

Defined in `enums/resource-type.enum.ts`:
- `Application` - Application project images
- `Technology` - Technology/framework icons
- `User` - User profile and component images

### 3. Image Types

Defined in `enums/image-type.enum.ts`:
- `Profile` - Profile/avatar images (400x400, cover fit)
- `Gallery` - Gallery/showcase images (1200x1200, inside fit)
- `Component` - Component-specific images (800x600, inside fit)

### 4. Image Configurations

Configurations are defined in `types/image-config.interface.ts`. Each resource type can have different configurations for different image types:

```typescript
{
  applications: {
    profile: { maxWidth: 400, maxHeight: 400, fit: 'cover', ... },
    gallery: { maxWidth: 1200, maxHeight: 1200, fit: 'inside', ... }
  },
  technologies: {
    profile: { maxWidth: 400, maxHeight: 400, outputFormat: 'png', ... }
  },
  users: {
    profile: { maxWidth: 400, maxHeight: 400, fit: 'cover', ... },
    component: { maxWidth: 800, maxHeight: 600, fit: 'inside', ... }
  }
}
```

## Use Cases

### Generic Use Cases
- `UploadResourceImageUseCase` - Upload a single image for any resource
- `UploadResourceImagesUseCase` - Upload multiple images for any resource
- `GetResourceImageUseCase` - Get image path for any resource
- `DeleteResourceImageUseCase` - Delete a single image for any resource
- `DeleteResourceImagesUseCase` - Delete multiple images for any resource

### Resource-Specific Use Cases

**Applications:**
- `UploadImagesUseCase` - Upload gallery images
- `UploadProfileImageUseCase` - Upload/update profile image
- `UpdateProfileImageUseCase` - Update profile image
- `GetImageUseCase` - Get gallery image
- `GetProfileImageUseCase` - Get profile image
- `DeleteImageUseCase` - Delete gallery image
- `DeleteProfileImageUseCase` - Delete profile image

**Technologies:**
- `UploadTechnologyProfileImageUseCase` - Upload technology icon
- `GetTechnologyProfileImageUseCase` - Get technology icon
- `DeleteTechnologyProfileImageUseCase` - Delete technology icon

**Users:**
- `UploadUserProfileImageUseCase` - Upload user profile image
- `GetUserProfileImageUseCase` - Get user profile image
- `DeleteUserProfileImageUseCase` - Delete user profile image
- `UploadUserComponentImageUseCase` - Upload component image (generic)
- `GetUserComponentImageUseCase` - Get component image (generic)
- `DeleteUserComponentImageUseCase` - Delete component image (generic)

**User Components (Certificates):**
- `UploadCertificateImageUseCase` - Upload certificate image
- `GetCertificateImageUseCase` - Get certificate image
- `DeleteCertificateImageUseCase` - Delete certificate image

## API Endpoints

### Applications
- `POST /images/applications/:id/images` - Upload gallery images
- `GET /images/applications/:id/images/:filename` - Get gallery image
- `DELETE /images/applications/:id/images/:filename` - Delete gallery image
- `POST /images/applications/:id/profile-image` - Upload profile image
- `PUT /images/applications/:id/profile-image` - Update profile image
- `GET /images/applications/:id/profile-image` - Get profile image
- `DELETE /images/applications/:id/profile-image` - Delete profile image

### Technologies
- `POST /images/technologies/:id/profile-image` - Upload technology icon
- `GET /images/technologies/:id/profile-image` - Get technology icon
- `DELETE /images/technologies/:id/profile-image` - Delete technology icon

### Users
- `POST /images/users/profile-image` - Upload user profile image (authenticated)
- `GET /images/users/:id/profile-image` - Get user profile image
- `DELETE /images/users/profile-image` - Delete user profile image (authenticated)

### User Certificates
- `POST /images/users/certificates/:certificateId/image` - Upload certificate image (authenticated)
- `GET /images/users/certificates/:certificateId/image` - Get certificate image
- `DELETE /images/users/certificates/:certificateId/image` - Delete certificate image (authenticated)

## Storage Structure

Images are stored in a hierarchical structure:

```
uploads/
├── .gitkeep
├── applications/
│   ├── .gitkeep
│   ├── 1/
│   │   ├── profile-{uuid}.jpg
│   │   └── gallery-{uuid}.jpg
│   └── 2/
│       └── profile-{uuid}.jpg
├── technologies/
│   ├── .gitkeep
│   └── 1/
│       └── profile-{uuid}.png
└── users/
    ├── .gitkeep
    └── 1/
        ├── profile-{uuid}.jpg
        └── certificates/
            └── component-{uuid}.jpg
```

## Docker Integration

The module is configured to persist images using Docker bind mounts:

```yaml
volumes:
  - ./backend/uploads:/app/uploads
```

This ensures:
- Images persist even if containers are removed
- The folder structure is tracked by git (via .gitkeep files)
- Actual image files are ignored by git

## Environment Variables

- `UPLOAD_PATH` - Base path for image storage (default: `./uploads`)
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: 5MB)

## Extending the Module

### Adding a New Resource Type

1. Add the resource type to `enums/resource-type.enum.ts`:
```typescript
export enum ResourceType {
    Application = 'applications',
    Technology = 'technologies',
    User = 'users',
    YourNewResource = 'your-new-resource', // Add here
}
```

2. Add configurations in `types/image-config.interface.ts`:
```typescript
export const DEFAULT_IMAGE_CONFIGS = {
    // ... existing configs
    'your-new-resource': {
        profile: {
            maxWidth: 400,
            maxHeight: 400,
            // ... configuration
        }
    }
};
```

3. Create use cases as needed (or use the generic ones)

4. Add endpoints to the controller

5. Create the directory structure:
```bash
mkdir backend/uploads/your-new-resource
echo "" > backend/uploads/your-new-resource/.gitkeep
```

### Custom Image Processing

You can register custom configurations at runtime:

```typescript
imageStorageService.registerResourceConfig('custom-resource', {
    profile: {
        maxWidth: 500,
        maxHeight: 500,
        fit: 'cover',
        quality: 95,
        progressive: true,
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        outputFormat: 'jpeg',
    }
});
```

## Testing

The module includes comprehensive tests:
- `images.service.integration.spec.ts` - Integration tests for the legacy service
- `images.module.integration.spec.ts` - Module integration tests
- `image-upload.service.integration.spec.ts` - Image upload service tests

Run tests with:
```bash
npm test images
```

## Migration Notes

### From Old Architecture

The old architecture had:
- `ImageUploadService` - Application-specific image handling
- `UserImageService` - User-specific image handling  
- Technology use-cases in the technologies module

The new architecture:
- Centralizes all image operations in the images module
- Provides generic services that work with any resource type
- Maintains backward compatibility through resource-specific use cases
- Offers better code reusability and maintainability

### Breaking Changes

If you were directly using:
- `UserImageService` → Use `ImageStorageService` with `ResourceType.User`
- Technology use-cases from technologies module → Import from images module

## Best Practices

1. **Always use use-cases** - Don't call services directly from controllers
2. **Validate before upload** - Check entity exists before uploading images
3. **Clean up old images** - Delete old images when updating
4. **Use appropriate image type** - Choose the right ImageType for your use case
5. **Handle errors gracefully** - Wrap operations in try-catch blocks
6. **Invalidate caches** - Clear caches after image operations

## Performance Considerations

- Images are automatically optimized using Sharp
- Progressive JPEG is enabled for faster loading
- Cache-Control headers are set for 1 year
- File streaming is used for efficient delivery
- Cleanup operations run asynchronously

## Security

- File type validation using MIME types
- File size limits enforced
- Path traversal protection
- Authentication required for uploads/deletes
- Role-based access control for admin operations

## Additional Documentation

- [User Components Guide](./USER_COMPONENTS_GUIDE.md) - Complete guide for managing images in user components (certificates, education, etc.)
- [Migration Guide](./MIGRATION_GUIDE.md) - How to migrate from the old architecture
- [Testing Guide](./TESTING.md) - How to test the images module

## Future Enhancements

- [ ] Support for image variants (thumbnails, multiple sizes)
- [ ] CDN integration
- [ ] Image URL signing
- [ ] Bulk operations API
- [ ] Image metadata extraction
- [ ] Advanced image transformations
- [ ] Cloud storage provider support (S3, Azure Blob, etc.)
- [ ] Support for education and experience component images


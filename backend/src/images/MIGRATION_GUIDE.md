# Migration Guide - Images Module Refactoring

This document outlines the complete refactoring of the Images Module and provides migration guidance.

## Overview

The Images Module has been completely refactored to centralize all image manipulation operations across the application. The new architecture is generic, flexible, and easy to extend for new resource types.

## What Changed

### 1. New Architecture

**Before:**
- `ImageUploadService` - Application-specific only
- `UserImageService` - User module only
- Technology use-cases spread across technologies module
- Each module managed its own images

**After:**
- `ImageStorageService` - Generic service for all resource types
- Centralized use-cases in images module
- Resource-specific configurations
- Single source of truth for image operations

### 2. Directory Structure

**Before:**
```
backend/src/
├── images/
│   ├── services/
│   │   └── image-upload.service.ts (applications only)
│   └── use-cases/ (applications only)
├── users/
│   └── services/
│       └── user-image.service.ts
└── technologies/
    └── use-cases/ (image use-cases)
```

**After:**
```
backend/src/
└── images/
    ├── enums/
    │   ├── resource-type.enum.ts
    │   └── image-type.enum.ts
    ├── types/
    │   └── image-config.interface.ts
    ├── services/
    │   ├── image-upload.service.ts (legacy)
    │   └── image-storage.service.ts (new)
    └── use-cases/
        ├── upload-resource-image.use-case.ts
        ├── delete-resource-image.use-case.ts
        ├── get-resource-image.use-case.ts
        ├── upload-images.use-case.ts (applications)
        ├── upload-profile-image.use-case.ts (applications)
        ├── upload-technology-profile-image.use-case.ts
        ├── upload-user-profile-image.use-case.ts
        └── ... (all image use-cases)
```

### 3. Storage Structure

**Before:**
```
uploads/
├── applications/
└── technologies/
```

**After:**
```
uploads/
├── .gitkeep
├── applications/
│   └── .gitkeep
├── technologies/
│   └── .gitkeep
└── users/
    └── .gitkeep
```

### 4. Docker Configuration

**Before:**
```yaml
volumes:
  - uploads_data:/app/uploads
```

**After:**
```yaml
volumes:
  - ./backend/uploads:/app/uploads
```

This change ensures images persist even when containers are removed, and the folder structure is tracked by git.

### 5. Environment Variables

**Before:**
```
UPLOAD_PATH=/app/uploads/applications
USER_UPLOAD_PATH=/app/uploads/users
```

**After:**
```
UPLOAD_PATH=/app/uploads
```

A single base path is now used for all resources.

## Migration Steps

### For Application Code

#### 1. Update Imports

**Before:**
```typescript
import { ImageUploadService } from '../images/services/image-upload.service';
import { UserImageService } from '../users/services/user-image.service';
```

**After:**
```typescript
import { ImageStorageService } from '../images/services/image-storage.service';
import { ResourceType } from '../images/enums/resource-type.enum';
import { ImageType } from '../images/enums/image-type.enum';
```

#### 2. Update Service Calls

**Before (Applications):**
```typescript
await imageUploadService.uploadImages(files, applicationId);
await imageUploadService.deleteApplicationImages(applicationId, [filename]);
await imageUploadService.getImagePath(applicationId, filename);
```

**After:**
```typescript
await imageStorageService.uploadImages(
    files,
    ResourceType.Application,
    applicationId,
    ImageType.Gallery
);
await imageStorageService.deleteImage(
    ResourceType.Application,
    applicationId,
    filename
);
await imageStorageService.getImagePath(
    ResourceType.Application,
    applicationId,
    filename
);
```

**Before (Users):**
```typescript
await userImageService.uploadProfileImage(file, userId);
await userImageService.deleteImage(userId, filename);
await userImageService.getImagePath(userId, filename);
```

**After:**
```typescript
await imageStorageService.uploadImage(
    file,
    ResourceType.User,
    userId,
    ImageType.Profile
);
await imageStorageService.deleteImage(
    ResourceType.User,
    userId,
    filename
);
await imageStorageService.getImagePath(
    ResourceType.User,
    userId,
    filename
);
```

#### 3. Update Module Imports

**Before (Users Module):**
```typescript
import { UserImageService } from './services/user-image.service';
import { UploadUserProfileImageUseCase } from './use-cases/upload-user-profile-image.use-case';

@Module({
    providers: [
        UsersService,
        UserImageService,
        UploadUserProfileImageUseCase,
    ],
    // ...
})
```

**After:**
```typescript
import { ImagesModule } from '../images/images.module';

@Module({
    providers: [
        UsersService,
        GetProfileUseCase,
        UpdateProfileUseCase,
    ],
    imports: [
        ImagesModule, // Import images module
        // ...
    ],
})
```

#### 4. Update Controllers

**Before (Users Controller):**
```typescript
@Post('profile/image')
async uploadProfileImage(
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
): Promise<User> {
    return await this.uploadUserProfileImageUseCase.execute(user.id, files[0]);
}
```

**After:**
Image endpoints are now handled by the Images Controller:
```typescript
// In ImagesController
@Post('users/profile-image')
@UseGuards(JwtAuthGuard)
async uploadUserProfileImage(
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
): Promise<User> {
    return await this.uploadUserProfileImageUseCase.execute(user.id, files[0]);
}
```

### For API Clients

#### Updated Endpoints

**Applications:**
- No changes to application endpoints
- All endpoints remain at `/images/applications/*`

**Technologies:**
- No changes to technology endpoints
- All endpoints remain at `/images/technologies/*`

**Users:**
- `POST /users/profile/image` → `POST /images/users/profile-image`
- `GET /users/:id/profile/image` → `GET /images/users/:id/profile-image`
- `DELETE /users/profile/image` → `DELETE /images/users/profile-image`

**User Certificates (New):**
- `POST /images/users/certificates/:certificateId/image` - Upload certificate image
- `GET /images/users/certificates/:certificateId/image` - Get certificate image
- `DELETE /images/users/certificates/:certificateId/image` - Delete certificate image

### For Docker Deployment

1. **Update docker-compose.yml** (already done)

2. **Migrate existing images:**
```bash
# No migration needed if you haven't deployed yet
# If you have existing images in a Docker volume:
docker cp backend_container:/app/uploads ./backend/uploads
```

3. **Restart containers:**
```bash
docker-compose down
docker-compose up -d
```

### For Local Development

1. **Create directory structure:**
```bash
cd backend/uploads
mkdir -p applications technologies users
touch .gitkeep applications/.gitkeep technologies/.gitkeep users/.gitkeep
```

2. **Update .env:**
```bash
# Remove or update:
# USER_UPLOAD_PATH=./uploads/users

# Ensure:
UPLOAD_PATH=./uploads
```

3. **Restart development server:**
```bash
npm run start:dev
```

## Verifying the Migration

### 1. Check Directory Structure
```bash
ls -la backend/uploads/
# Should show: applications/, technologies/, users/, and .gitkeep files
```

### 2. Test Image Upload
```bash
# Applications
curl -X POST http://localhost:3000/images/applications/1/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@test.jpg"

# Users
curl -X POST http://localhost:3000/images/users/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "profileImage=@profile.jpg"

# Technologies
curl -X POST http://localhost:3000/images/technologies/1/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "profileImage=@icon.png"
```

### 3. Check File System
```bash
find backend/uploads -name "*.jpg" -o -name "*.png"
# Should list uploaded images
```

### 4. Run Tests
```bash
npm test -- images
```

## Rollback Plan

If you need to rollback:

1. **Restore old files:**
   - Restore `backend/src/users/services/user-image.service.ts`
   - Restore `backend/src/users/use-cases/upload-user-profile-image.use-case.ts`
   - Restore `backend/src/technologies/use-cases/*-profile-image.use-case.ts`

2. **Revert module changes:**
   - Restore `backend/src/users/users.module.ts`
   - Restore `backend/src/users/users.controller.ts`
   - Restore `backend/src/images/images.module.ts`

3. **Revert Docker configuration:**
   - Restore `docker-compose.yml`

4. **Restart services:**
```bash
docker-compose down
docker-compose up -d
```

## Known Issues & Solutions

### Issue 1: "Image not found" errors
**Cause:** Path mismatch between old and new structure
**Solution:** Ensure UPLOAD_PATH is set to `./uploads` (not `./uploads/applications`)

### Issue 2: Permission errors in Docker
**Cause:** Bind mount permissions
**Solution:**
```bash
chmod -R 755 backend/uploads
# Or in Dockerfile:
RUN chown -R node:node /app/uploads
```

### Issue 3: Missing .gitkeep files
**Cause:** .gitkeep files not tracked
**Solution:**
```bash
git add -f backend/uploads/.gitkeep
git add -f backend/uploads/*/.gitkeep
```

## Benefits of New Architecture

1. **Centralization:** All image logic in one place
2. **Reusability:** Generic services work for any resource
3. **Maintainability:** Easier to update and extend
4. **Consistency:** Same patterns across all resources
5. **Flexibility:** Easy to add new resource types
6. **Better organization:** Clear separation of concerns
7. **Type safety:** Strong typing with TypeScript enums
8. **Configurability:** Resource-specific configurations

## Next Steps

1. Monitor logs for any issues
2. Update frontend to use new endpoints (if changed)
3. Update API documentation
4. Consider adding image variants (thumbnails)
5. Implement CDN integration
6. Add image metadata extraction

## Support

For issues or questions:
1. Check this migration guide
2. Review the [README.md](./README.md)
3. Check the [TESTING.md](./TESTING.md)
4. Open an issue in the repository

## Changelog

### v2.0.0 - Major Refactoring
- ✅ Centralized all image operations in images module
- ✅ Created generic ImageStorageService
- ✅ Moved user image logic to images module
- ✅ Moved technology image logic to images module
- ✅ Added resource-specific configurations
- ✅ Updated Docker configuration for image persistence
- ✅ Added .gitkeep files for folder structure
- ✅ Updated .gitignore to exclude images but keep folders
- ✅ Created comprehensive documentation
- ✅ Removed deprecated services and use-cases

### Deprecated
- ❌ `UserImageService` - Use `ImageStorageService` instead
- ❌ `ImageUploadService` (applications only) - Use `ImageStorageService` instead
- ❌ Technology use-cases in technologies module - Use images module instead


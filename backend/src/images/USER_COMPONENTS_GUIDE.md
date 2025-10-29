# User Components Image Management Guide

This guide explains how the Images Module handles images for user components, such as certificates, education records, and experience entries.

## Overview

User components (certificates, education, experience, etc.) can have associated images. The Images Module provides a centralized way to manage these images through:

1. **Generic use-cases** - For custom component types
2. **Specific use-cases** - For known components like certificates

## Supported Components

### 1. Certificates (`UserComponentCertificate`)

Certificates can have a profile image that shows the certificate document.

**Entity Field:**
```typescript
@Column({ nullable: true })
profileImage?: string;
```

**Storage Path:**
```
uploads/users/{userId}/certificates/{filename}
```

**API Endpoints:**
- `POST /images/users/certificates/:certificateId/image` - Upload certificate image
- `GET /images/users/certificates/:certificateId/image` - Get certificate image
- `DELETE /images/users/certificates/:certificateId/image` - Delete certificate image

**Example Usage:**

```typescript
// Upload certificate image
const formData = new FormData();
formData.append('certificateImage', file);

const response = await fetch(
  `/images/users/certificates/${certificateId}/image`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  }
);
```

**Image Configuration:**
- Max size: 5MB
- Allowed formats: JPEG, PNG, WebP
- Processed size: 800x600 (fit inside)
- Quality: 85%
- Output format: JPEG

### 2. Future Components

The architecture is ready to support images for other components:
- Education records
- Experience entries
- Projects
- Awards/Achievements

## Architecture

### Generic Approach

For any component type, you can use the generic use-cases:

```typescript
// Upload
await uploadUserComponentImageUseCase.execute(
  userId,
  file,
  'component-type' // e.g., 'certificates', 'education', etc.
);

// Get
await getUserComponentImageUseCase.execute(
  userId,
  filename,
  'component-type'
);

// Delete
await deleteUserComponentImageUseCase.execute(
  userId,
  filename,
  'component-type'
);
```

### Specific Use-Cases

For commonly used components, create dedicated use-cases:

```typescript
// Example: UploadCertificateImageUseCase
@Injectable()
export class UploadCertificateImageUseCase {
  async execute(userId: number, certificateId: number, file: File) {
    // 1. Find the certificate
    // 2. Verify ownership
    // 3. Delete old image if exists
    // 4. Upload new image
    // 5. Update entity
  }
}
```

## Storage Structure

```
uploads/
└── users/
    ├── .gitkeep
    └── {userId}/
        ├── profile-{uuid}.jpg              # User profile image
        ├── certificates/
        │   └── component-{uuid}.jpg        # Certificate images
        ├── education/
        │   └── component-{uuid}.jpg        # Education images (future)
        └── experience/
            └── component-{uuid}.jpg        # Experience images (future)
```

## Adding Images to New Components

### Step 1: Add Entity Field

```typescript
@Entity('users_components_your_component')
export class UserComponentYourComponent {
  @Column({ nullable: true })
  profileImage?: string;
  
  // ... other fields
}
```

### Step 2: Update DTO

```typescript
export class UserComponentYourComponentDto {
  @IsOptional()
  @IsString()
  profileImage?: string;
  
  // ... other fields
}
```

### Step 3: Create Use-Cases

Create three use-cases:
1. `UploadYourComponentImageUseCase`
2. `GetYourComponentImageUseCase`
3. `DeleteYourComponentImageUseCase`

**Template:**
```typescript
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserComponentYourComponent } from '../../users/user-components/entities/your-component.entity';
import { ComponentNotFoundException } from '../../users/user-components/exceptions/user-component.exceptions';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageType } from '../enums/image-type.enum';

@Injectable()
export class UploadYourComponentImageUseCase {
    constructor(
        @InjectRepository(UserComponentYourComponent)
        private readonly repository: Repository<UserComponentYourComponent>,
        private readonly imageStorageService: ImageStorageService,
    ) {}

    async execute(
        userId: number,
        componentId: number,
        file: Express.Multer.File,
    ): Promise<UserComponentYourComponent> {
        const component = await this.repository.findOne({
            where: { id: componentId },
        });

        if (!component || component.userId !== userId) {
            throw new ComponentNotFoundException('Component not found');
        }

        // Delete old image if exists
        if (component.profileImage) {
            await this.imageStorageService.deleteImage(
                ResourceType.User,
                userId,
                component.profileImage,
                'your-component-type',
            );
        }

        // Upload new image
        const filename = await this.imageStorageService.uploadImage(
            file,
            ResourceType.User,
            userId,
            ImageType.Component,
            'your-component-type',
        );

        component.profileImage = filename;
        return await this.repository.save(component);
    }
}
```

### Step 4: Add Endpoints

Add endpoints to `images.controller.ts`:

```typescript
@Post('users/your-component/:componentId/image')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FilesInterceptor('image', 1, {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        cb(null, allowedMimes.includes(file.mimetype));
    },
}))
async uploadYourComponentImage(
    @CurrentUser() user: User,
    @Param('componentId', ParseIntPipe) componentId: number,
    @UploadedFiles() files: Express.Multer.File[],
) {
    if (!files?.length) throw new Error('No file uploaded');
    return await this.uploadYourComponentImageUseCase.execute(
        user.id,
        componentId,
        files[0]
    );
}

@Get('users/your-component/:componentId/image')
async getYourComponentImage(
    @Param('componentId', ParseIntPipe) componentId: number,
    @Res() res: Response,
): Promise<void> {
    const imagePath = await this.getYourComponentImageUseCase.execute(componentId);
    res.set({
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
    });
    fs.createReadStream(imagePath).pipe(res);
}

@Delete('users/your-component/:componentId/image')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.NO_CONTENT)
async deleteYourComponentImage(
    @CurrentUser() user: User,
    @Param('componentId', ParseIntPipe) componentId: number,
): Promise<void> {
    await this.deleteYourComponentImageUseCase.execute(user.id, componentId);
}
```

### Step 5: Update Module

Add to `images.module.ts`:

```typescript
import { UserComponentYourComponent } from '../users/user-components/entities/your-component.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // ... existing entities
      UserComponentYourComponent,
    ]),
  ],
  providers: [
    // ... existing providers
    UploadYourComponentImageUseCase,
    GetYourComponentImageUseCase,
    DeleteYourComponentImageUseCase,
  ],
  exports: [
    // ... existing exports
    UploadYourComponentImageUseCase,
    GetYourComponentImageUseCase,
    DeleteYourComponentImageUseCase,
  ],
})
```

### Step 6: Create Directory

```bash
mkdir -p backend/uploads/users
# Directory will be created automatically on first upload
# but you can pre-create with .gitkeep:
mkdir -p backend/uploads/users/{userId}/your-component-type
echo "" > backend/uploads/users/.gitkeep
```

## Best Practices

### 1. Ownership Verification

Always verify that the user owns the component:

```typescript
if (component.userId !== userId) {
    throw new ComponentNotFoundException('Component not found');
}
```

### 2. Cleanup Old Images

When updating or deleting components, clean up associated images:

```typescript
// In delete component use-case
if (component.profileImage) {
    await imageStorageService.deleteImage(
        ResourceType.User,
        userId,
        component.profileImage,
        'component-type',
    );
}
```

### 3. Transaction Safety

For critical operations, use transactions:

```typescript
await this.dataSource.transaction(async (manager) => {
    // Upload image
    const filename = await imageStorageService.uploadImage(...);
    
    // Update entity
    component.profileImage = filename;
    await manager.save(component);
});
```

### 4. Error Handling

Handle errors gracefully:

```typescript
try {
    await imageStorageService.deleteImage(...);
} catch (error) {
    // Log but don't throw - file might already be deleted
    console.error('Failed to delete image:', error);
}
```

## Security Considerations

### 1. Authentication

All upload/delete endpoints require authentication:

```typescript
@UseGuards(JwtAuthGuard)
```

### 2. Authorization

Verify user owns the resource:

```typescript
if (component.userId !== user.id) {
    throw new ForbiddenException();
}
```

### 3. File Validation

- MIME type validation
- File size limits
- Content validation (prevent malicious files)

### 4. Path Traversal Prevention

Never use user input directly in file paths:

```typescript
// Good
const path = `uploads/users/${userId}/certificates/${filename}`;

// Bad
const path = `uploads/users/${userProvidedPath}`;
```

## Testing

### Unit Test Example

```typescript
describe('UploadCertificateImageUseCase', () => {
    let useCase: UploadCertificateImageUseCase;
    let repository: Repository<UserComponentCertificate>;
    let imageStorageService: ImageStorageService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UploadCertificateImageUseCase,
                {
                    provide: getRepositoryToken(UserComponentCertificate),
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

        useCase = module.get(UploadCertificateImageUseCase);
        repository = module.get(getRepositoryToken(UserComponentCertificate));
        imageStorageService = module.get(ImageStorageService);
    });

    it('should upload certificate image', async () => {
        const mockCertificate = {
            userId: 1,
            profileImage: null,
        };
        
        jest.spyOn(repository, 'findOne').mockResolvedValue(mockCertificate);
        jest.spyOn(imageStorageService, 'uploadImage').mockResolvedValue('new-image.jpg');
        jest.spyOn(repository, 'save').mockResolvedValue({
            ...mockCertificate,
            profileImage: 'new-image.jpg',
        });

        const file = createMockFile();
        const result = await useCase.execute(1, 1, file);

        expect(result.profileImage).toBe('new-image.jpg');
        expect(imageStorageService.uploadImage).toHaveBeenCalledWith(
            file,
            ResourceType.User,
            1,
            ImageType.Component,
            'certificates',
        );
    });
});
```

## Troubleshooting

### Issue: "Component not found"
**Cause:** Component doesn't exist or user doesn't own it
**Solution:** Verify componentId and userId match

### Issue: Images not persisting after Docker restart
**Cause:** Not using bind mount
**Solution:** Use `./backend/uploads:/app/uploads` in docker-compose.yml

### Issue: Permission denied
**Cause:** File permissions on uploads directory
**Solution:** 
```bash
chmod -R 755 backend/uploads
# or in Dockerfile:
RUN chown -R node:node /app/uploads
```

### Issue: "File too large"
**Cause:** File exceeds 5MB limit
**Solution:** Either reduce file size or increase limit in controller

## FAQ

**Q: Can I store multiple images per component?**
A: The current implementation supports one profile image per component. For multiple images, you can either:
1. Add an `images: string[]` field to the entity
2. Create a separate entity for component images

**Q: How do I migrate existing images?**
A: If images are currently stored elsewhere:
```typescript
// Migration script
const oldPath = 'old/path/image.jpg';
const userId = 123;
const newFilename = await imageStorageService.uploadImage(
    readFileSync(oldPath),
    ResourceType.User,
    userId,
    ImageType.Component,
    'certificates',
);
// Update entity with newFilename
```

**Q: Can I use different image formats for different components?**
A: Yes! Customize the configuration in `DEFAULT_IMAGE_CONFIGS`:
```typescript
users: {
    component: {
        // Custom config per component type
    }
}
```

## Summary

The Images Module provides complete support for user component images:

✅ Centralized management
✅ Secure uploads with ownership verification
✅ Automatic image processing and optimization
✅ Flexible architecture for any component type
✅ Specific use-cases for certificates (extensible to other components)
✅ Clean storage structure
✅ Docker-ready persistence

For questions or issues, refer to:
- [Main README](./README.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Testing Guide](./TESTING.md)


# Frontend Images Update Guide

## Summary

O frontend foi completamente atualizado para refletir a refatoração do módulo de imagens no backend. Todos os endpoints de imagem agora passam pelo módulo centralizado `/images/*`.

## What Changed

### 1. New Services

#### `services/images.service.ts` (NEW)
Novo service centralizado que gerencia **todas** as operações de imagem:

**User Images:**
- `uploadUserProfileImage(file)` - Upload imagem de perfil
- `getUserProfileImageUrl(userId)` - Get URL da imagem
- `deleteUserProfileImage()` - Deletar imagem de perfil

**Certificate Images:**
- `uploadCertificateImage(certificateId, file)` - Upload imagem de certificado
- `getCertificateImageUrl(certificateId)` - Get URL da imagem
- `deleteCertificateImage(certificateId)` - Deletar imagem

**Application Images:**
- `uploadApplicationImages(appId, files)` - Upload múltiplas imagens
- `uploadApplicationProfileImage(appId, file)` - Upload imagem de perfil
- `updateApplicationProfileImage(appId, file)` - Atualizar imagem de perfil
- `getApplicationImageUrl(appId, filename)` - Get URL da imagem
- `getApplicationProfileImageUrl(appId)` - Get URL da imagem de perfil
- `deleteApplicationImage(appId, filename)` - Deletar imagem
- `deleteApplicationProfileImage(appId)` - Deletar imagem de perfil

**Technology Images:**
- `uploadTechnologyProfileImage(techId, file)` - Upload imagem de perfil
- `getTechnologyProfileImageUrl(techId)` - Get URL da imagem
- `deleteTechnologyProfileImage(techId)` - Deletar imagem

#### `services/users.service.ts` (UPDATED)
Adicionados métodos de manipulação de imagem:

```typescript
// New methods
async uploadProfileImage(file: File): Promise<User>
getProfileImageUrl(userId: number): string
async deleteProfileImage(): Promise<void>
```

### 2. New Components

#### `components/users/UserProfileImageUpload.tsx` (NEW)
Componente para upload/gerenciamento de imagem de perfil do usuário.

**Props:**
```typescript
{
  currentUser: User;
  onProfileImageChange?: (user: User) => void;
  disabled?: boolean;
  showPreview?: boolean;
}
```

**Features:**
- Preview da imagem atual
- Upload com drag & drop (planejado)
- Validação de tipo e tamanho
- Delete com confirmação
- Atualização automática do localStorage

#### `components/users/CertificateImageUpload.tsx` (NEW)
Componente para upload/gerenciamento de imagem de certificado.

**Props:**
```typescript
{
  certificateId: number;
  currentImage?: string | null;
  onImageChange?: (image: string | null) => void;
  disabled?: boolean;
  showPreview?: boolean;
}
```

**Features:**
- Preview da imagem do certificado
- Upload de arquivo único
- Validação de tipo e tamanho
- Delete com confirmação

### 3. Updated Types

#### `types/entities/user.entity.ts` (UPDATED)
Adicionado campo `profileImage`:

```typescript
export interface User {
    id: number;
    name?: string;
    email: string;
    role: RoleEnum;
    profileImage?: string | null; // NEW
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
```

### 4. Services Already Updated (No Changes Needed)

- ✅ `services/applications.service.ts` - Já usa `/images/applications/*`
- ✅ `services/technologies.service.ts` - Já usa `/images/technologies/*`

## API Endpoints Changes

### Before vs After

**User Profile Images:**
```diff
- POST /users/profile/image
+ POST /images/users/profile-image

- GET /users/:id/profile/image
+ GET /images/users/:id/profile-image

- DELETE /users/profile/image
+ DELETE /images/users/profile-image
```

**Certificates (NEW):**
```typescript
POST   /images/users/certificates/:certificateId/image   // Upload
GET    /images/users/certificates/:certificateId/image   // Get
DELETE /images/users/certificates/:certificateId/image   // Delete
```

**Applications (No changes):**
- Already using `/images/applications/*`

**Technologies (No changes):**
- Already using `/images/technologies/*`

## Usage Examples

### 1. User Profile Image

```tsx
import UserProfileImageUpload from '@/components/users/UserProfileImageUpload';
import { UsersService } from '@/services/users.service';

function ProfilePage() {
  const [user, setUser] = useState<User>(UsersService.getUserStorage());

  return (
    <UserProfileImageUpload
      currentUser={user}
      onProfileImageChange={(updatedUser) => {
        setUser(updatedUser);
        // User is automatically updated in localStorage
      }}
      showPreview={true}
    />
  );
}
```

### 2. Certificate Image

```tsx
import CertificateImageUpload from '@/components/users/CertificateImageUpload';

function CertificateForm({ certificate }) {
  const [profileImage, setProfileImage] = useState(certificate.profileImage);

  return (
    <CertificateImageUpload
      certificateId={certificate.userId}
      currentImage={profileImage}
      onImageChange={(newImage) => {
        setProfileImage(newImage);
      }}
      showPreview={true}
    />
  );
}
```

### 3. Using ImagesService Directly

```typescript
import { ImagesService } from '@/services/images.service';

// Upload user profile image
const uploadUserImage = async (file: File) => {
  try {
    const updatedUser = await ImagesService.uploadUserProfileImage(file);
    console.log('Image uploaded:', updatedUser.profileImage);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Get image URL
const imageUrl = ImagesService.getUserProfileImageUrl(userId);

// Upload certificate image
const uploadCertImage = async (certificateId: number, file: File) => {
  try {
    const certificate = await ImagesService.uploadCertificateImage(certificateId, file);
    console.log('Certificate image uploaded:', certificate.profileImage);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## File Structure

```
frontend/
├── services/
│   ├── images.service.ts           ✨ NEW - Centralized images service
│   ├── users.service.ts            ✅ UPDATED - Added image methods
│   ├── applications.service.ts     ✅ No changes (already correct)
│   └── technologies.service.ts     ✅ No changes (already correct)
├── components/
│   ├── users/
│   │   ├── UserProfileImageUpload.tsx    ✨ NEW
│   │   └── CertificateImageUpload.tsx    ✨ NEW
│   └── applications/
│       ├── ImageUpload.tsx               ✅ No changes needed
│       └── ProfileImageUpload.tsx        ✅ No changes needed
└── types/
    └── entities/
        └── user.entity.ts          ✅ UPDATED - Added profileImage field
```

## Migration Checklist

### For Developers

- [x] Create `ImagesService` with all image operations
- [x] Update `UsersService` with image methods
- [x] Add `profileImage` field to `User` type
- [x] Create `UserProfileImageUpload` component
- [x] Create `CertificateImageUpload` component
- [x] Update documentation

### For Implementation

- [ ] Add `UserProfileImageUpload` to profile page
- [ ] Add `CertificateImageUpload` to certificate forms
- [ ] Test all image upload flows
- [ ] Test image deletion
- [ ] Test error handling
- [ ] Verify localStorage updates

## Image Specifications

### User Profile Image
- **Size:** 400x400px (square)
- **Format:** JPEG, PNG, WebP
- **Max Size:** 5MB
- **Processing:** Cropped to center, 90% quality

### Certificate Image
- **Size:** 800x600px
- **Format:** JPEG, PNG, WebP
- **Max Size:** 5MB
- **Processing:** Fit inside, 85% quality

### Application Images
- **Gallery:** 1200x1200px, fit inside, 85% quality
- **Profile:** 400x400px, cover fit, 90% quality

### Technology Images
- **Profile:** 400x400px, fit inside, 90% quality
- **Formats:** JPEG, PNG, WebP, SVG

## Error Handling

All image operations include error handling:

```typescript
try {
  const result = await ImagesService.uploadUserProfileImage(file);
  toast.success('Image uploaded successfully!');
} catch (error: any) {
  const errorMessage = error?.response?.data?.message 
    || error?.message 
    || 'Failed to upload image';
  toast.error(errorMessage);
}
```

Common errors:
- `400` - Invalid file type or size
- `401` - Not authenticated
- `403` - Not authorized (trying to upload to another user's resource)
- `404` - Resource not found
- `500` - Server error

## Testing

### Manual Testing

1. **User Profile Image:**
   ```bash
   1. Go to /admin/profile
   2. Click "Upload Image"
   3. Select a valid image file
   4. Verify preview updates
   5. Verify localStorage is updated
   6. Reload page and verify image persists
   7. Delete image
   8. Verify image is removed
   ```

2. **Certificate Image:**
   ```bash
   1. Create/edit a certificate
   2. Use CertificateImageUpload component
   3. Upload an image
   4. Verify preview
   5. Delete image
   6. Verify removal
   ```

### Automated Testing (TODO)

```typescript
describe('ImagesService', () => {
  it('should upload user profile image', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await ImagesService.uploadUserProfileImage(file);
    expect(result.profileImage).toBeTruthy();
  });

  it('should delete user profile image', async () => {
    await ImagesService.deleteUserProfileImage();
    const user = UsersService.getUserStorage();
    expect(user?.profileImage).toBeNull();
  });
});
```

## Benefits

### For Users
- ✅ Consistent image upload experience across all resources
- ✅ Better error messages
- ✅ Automatic image optimization
- ✅ Preview before and after upload
- ✅ Easy image deletion

### For Developers
- ✅ Single source of truth (`ImagesService`)
- ✅ Reusable components
- ✅ Type-safe operations
- ✅ Consistent error handling
- ✅ Easy to extend for new resource types

### For Maintenance
- ✅ Centralized image logic
- ✅ Easy to update API endpoints
- ✅ Consistent patterns across all image operations
- ✅ Well documented

## Next Steps

1. **Immediate:**
   - [ ] Integrate `UserProfileImageUpload` into profile page
   - [ ] Add certificate image upload to certificate management
   - [ ] Test all flows

2. **Short-term:**
   - [ ] Add image cropping before upload
   - [ ] Add bulk image upload for applications
   - [ ] Add image preview modal

3. **Long-term:**
   - [ ] Implement progressive image loading
   - [ ] Add image CDN support
   - [ ] Implement image compression on client side

## Troubleshooting

### Issue: "Failed to upload image"
**Solution:** Check:
- File size < 5MB
- File type is JPEG, PNG, or WebP
- User is authenticated
- Network connection is stable

### Issue: "Image not displaying"
**Solution:**
- Clear browser cache
- Check if backend is running
- Verify image URL is correct
- Check browser console for errors

### Issue: "localStorage not updating"
**Solution:**
- Check if `onProfileImageChange` callback is being called
- Verify `UsersService.uploadProfileImage` is updating localStorage
- Clear localStorage and login again

## Support

For questions or issues:
1. Check this guide
2. Check backend documentation: `backend/src/images/README.md`
3. Check migration guide: `backend/src/images/MIGRATION_GUIDE.md`
4. Check components guide: `backend/src/images/USER_COMPONENTS_GUIDE.md`

## Changelog

### v2.0.0 - Images Module Refactoring
- ✅ Created centralized `ImagesService`
- ✅ Updated `UsersService` with image methods
- ✅ Added `profileImage` field to User type
- ✅ Created `UserProfileImageUpload` component
- ✅ Created `CertificateImageUpload` component
- ✅ All endpoints now use `/images/*` pattern
- ✅ Full TypeScript support
- ✅ Comprehensive error handling
- ✅ Complete documentation


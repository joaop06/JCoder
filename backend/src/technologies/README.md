# Technologies Module

## Overview

The Technologies module manages technology records displayed on the portfolio website. It provides a complete CRUD API for creating, updating, retrieving, and deleting technology entries, along with profile image management for each technology.

## Features

- ✅ Full CRUD operations for technologies
- ✅ Profile image upload and management for each technology
- ✅ Pagination and filtering support
- ✅ Query by active status
- ✅ Display order management for sorting
- ✅ Soft delete functionality
- ✅ Cache integration for improved performance
- ✅ Role-based access control (Admin only for write operations)

## Entity Structure

### Technology Entity

```typescript
{
  id: number;                          // Auto-generated primary key
  name: string;                        // Unique technology name (e.g., "Node.js")
  profileImage?: string;               // Profile image filename
  displayOrder: number;                // Sort order (default: 1)
  isActive: boolean;                   // Visibility status (default: true)
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Last update timestamp
  deletedAt?: Date;                    // Soft delete timestamp
}
```

## API Endpoints

### Public Endpoints

#### Get All Technologies
```http
GET /api/v1/technologies
```
Returns all active technologies without pagination.

**Query Parameters:**
- Standard TypeORM query options supported via `@ParseQuery()`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Node.js",
    "profileImage": "nodejs-logo.png",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### Get Technologies (Paginated)
```http
GET /api/v1/technologies/paginated?page=1&limit=10&sortBy=displayOrder&sortOrder=ASC
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `sortBy` (string, default: 'displayOrder') - Sort field
- `sortOrder` ('ASC' | 'DESC', default: 'ASC') - Sort direction

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 18,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Query Technologies with Filters
```http
GET /api/v1/technologies/query?isActive=true&page=1&limit=10
```

**Query Parameters:**
- All pagination parameters
- `isActive` (boolean) - Filter by active status

#### Get Technology by ID
```http
GET /api/v1/technologies/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Node.js",
  ...
}
```

#### Get Technology Profile Image
```http
GET /api/v1/technologies/:id/profile-image
```

**Response:** Image file (PNG, JPEG, WebP, or SVG)

### Admin Endpoints (Authentication Required)

All write operations require:
- Valid JWT token in Authorization header
- Admin role

#### Create Technology
```http
POST /api/v1/technologies
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "TypeScript"
}
```

#### Update Technology
```http
PUT /api/v1/technologies/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "TypeScript",
  "isActive": false
}
```

#### Delete Technology (Soft Delete)
```http
DELETE /api/v1/technologies/:id
Authorization: Bearer <jwt_token>
```

**Response:** 204 No Content

#### Upload Profile Image
```http
POST /api/v1/technologies/:id/profile-image
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

profileImage: <file>
```

**Constraints:**
- Max file size: 5MB
- Allowed formats: JPEG, PNG, WebP, SVG
- Field name: `profileImage`

**Response:**
```json
{
  "id": 1,
  "name": "Node.js",
  "profileImage": "generated-filename.png",
  ...
}
```

#### Delete Profile Image
```http
DELETE /api/v1/technologies/:id/profile-image
Authorization: Bearer <jwt_token>
```

**Response:** 204 No Content

## Use Cases

The module implements the following use cases:

1. **CreateTechnologyUseCase**: Creates a new technology with validation
2. **UpdateTechnologyUseCase**: Updates existing technology with uniqueness checks
3. **DeleteTechnologyUseCase**: Soft deletes a technology
4. **UploadTechnologyProfileImageUseCase**: Handles profile image uploads
5. **DeleteTechnologyProfileImageUseCase**: Removes profile images

## Service Layer

The `TechnologiesService` provides:

- CRUD operations with TypeORM
- Cache integration for improved performance
- Automatic cache invalidation on mutations
- Pagination support
- Query filtering by active status
- Soft delete and restore capabilities

### Cache Keys

- `technologies:paginated:*` - Paginated results (5 min TTL)
- `technologies:query:*` - Filtered query results (5 min TTL)
- `technology:{id}` - Individual technology (10 min TTL)

## Exceptions

Custom exceptions thrown by the module:

- `TechnologyNotFoundException` - Technology not found (404)
- `TechnologyAlreadyExistsException` - Duplicate technology name (409)
- `TechnologyAlreadyDeletedException` - Already deleted (400)

## File Storage

Profile images are stored in:
```
backend/uploads/technologies/
```

The `ImageUploadService` handles:
- File validation
- Unique filename generation
- File deletion
- Path resolution

## Database Schema

The `technologies` table is created automatically via TypeORM synchronization:

```sql
CREATE TABLE `technologies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL UNIQUE,
  `profileImage` varchar(255) NULL,
  `displayOrder` int NOT NULL DEFAULT 1,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) NULL,
  PRIMARY KEY (`id`)
);
```

## Integration Example

### Frontend Usage

```typescript
// Get all active technologies
const activeTechs = await fetch('/api/v1/technologies/query?isActive=true');

// Display with profile image
const tech = await fetch('/api/v1/technologies/1').then(r => r.json());
const imageUrl = `/api/v1/technologies/${tech.id}/profile-image`;
```

### Admin Operations

```typescript
// Create new technology
const response = await fetch('/api/v1/technologies', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'NestJS'
  })
});

// Upload profile image
const formData = new FormData();
formData.append('profileImage', file);

await fetch(`/api/v1/technologies/${id}/profile-image`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

## Testing

To test the module:

```bash
# Run unit tests
npm run test technologies

# Run integration tests
npm run test:e2e

# Run with coverage
npm run test:cov
```

## Migration from Frontend

If you have existing technology icons in `frontend/public/icons/technologies_and_stacks/`, you can:

1. Create technology records via API
2. Upload corresponding images as profile images
3. Update display order for proper sorting

Example script:
```typescript
const technologies = [
  { name: 'Node.js', icon: 'nodejs.png' },
  { name: 'TypeScript', icon: 'typescript.png' },
  // ... more
];

for (const tech of technologies) {
  const created = await createTechnology({ name: tech.name });
  await uploadProfileImage(created.id, `icons/technologies_and_stacks/${tech.icon}`);
}
```

## Notes

- All write operations require Admin role
- Profile images are automatically deleted on technology soft delete
- Cache is automatically invalidated on create/update/delete operations
- Display order defaults to 1 if not specified
- Technologies can be restored after soft delete using the service's `restore()` method

## Dependencies

- `@nestjs/common` - NestJS core
- `@nestjs/typeorm` - TypeORM integration
- `typeorm` - Database ORM
- `@nestjs/cache-manager` - Caching
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation
- `@nestjs/swagger` - API documentation
- `multer` - File upload handling

## Future Enhancements

Potential improvements:
- [ ] Technology relationships (e.g., "used with")
- [ ] Proficiency level tracking
- [ ] Multiple images per technology
- [ ] Technology tags/keywords
- [ ] Usage statistics
- [ ] External links (documentation, tutorials)


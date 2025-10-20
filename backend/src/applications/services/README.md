# Image Upload Service

This service manages the upload, processing and storage of images for applications.

## Features

- **Multiple image upload**: Support for up to 10 images per request
- **Automatic compression**: Resizing and optimization using Sharp
- **File validation**: MIME type and size verification
- **Organized storage**: Folder structure by application ID
- **Automatic cleanup**: File removal on application deletion

## Configuration

### Environment Variables

```env
UPLOAD_PATH=./uploads/applications  # Base path for uploads
MAX_FILE_SIZE=5242880               # Maximum size in bytes (5MB)
```

### Supported File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

## Endpoints

### Upload Images
```
POST /applications/:id/images
Content-Type: multipart/form-data
```

**Parameters:**
- `images`: Array of files (maximum 10)

**Response:**
```json
{
  "id": 1,
  "name": "Application Name",
  "images": ["uuid1.jpg", "uuid2.png"]
}
```

### View Image
```
GET /applications/:id/images/:filename
```

**Response:** Image file with appropriate headers

### Delete Image
```
DELETE /applications/:id/images/:filename
```

**Response:** 204 No Content

## Storage Structure

```
uploads/
└── applications/
    ├── 1/
    │   ├── uuid1.jpg
    │   └── uuid2.png
    └── 2/
        └── uuid3.webp
```

## Image Processing

- **Resizing**: Maximum 1200x1200px maintaining aspect ratio
- **Compression**: JPEG quality 85% with progressive optimization
- **Output format**: Web-optimized JPEG
- **Unique names**: UUID v4 to avoid conflicts

## Security

- MIME type validation
- File size limit
- Permission verification (Admin only)
- File name sanitization

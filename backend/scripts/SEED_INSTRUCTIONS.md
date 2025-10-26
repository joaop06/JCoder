# Technologies Seed Script Instructions

## Overview

This script automatically populates your database with initial technology records based on the technologies displayed in your frontend.

## Prerequisites

1. **Backend server running**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Admin credentials**
   - You need an admin account to create technologies
   - Default admin can be created via the initial user script

3. **Node.js packages installed**
   ```bash
   npm install node-fetch form-data
   ```

## How to Use

### Step 1: Get Admin Token

Sign in as admin to get JWT token:

```bash
curl -X POST http://localhost:3001/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jcoder.com",
    "password": "your_admin_password"
  }'
```

Copy the `access_token` from the response.

### Step 2: Run the Seed Script

```bash
cd backend
ADMIN_TOKEN=your_token_here npx ts-node scripts/seed-technologies.ts
```

Or on Windows PowerShell:
```powershell
$env:ADMIN_TOKEN="your_token_here"
npx ts-node scripts/seed-technologies.ts
```

### Step 3: Verify

Check if technologies were created:
```bash
curl http://localhost:3001/api/v1/technologies
```

## What the Script Does

1. **Creates 18 technology records** covering:
   - Backend: Node.js, TypeScript, NestJS, Express
   - Databases: MySQL, PostgreSQL, Firebird
   - ORMs: Sequelize, TypeORM
   - Infrastructure: Docker, RabbitMQ, Ubuntu, PM2
   - Frontend: React, Vue.js
   - Mobile: React Native, Flutter
   - Version Control: Git

2. **Uploads profile images** (if available):
   - Looks for icons in `frontend/public/icons/technologies_and_stacks/`
   - Automatically uploads them as profile images
   - Skips if icon file not found (no error)

3. **Sets display order**:
   - Technologies are ordered from 1-18
   - This controls the display order on frontend

## Customization

### Add More Technologies

Edit `scripts/seed-technologies.ts` and add to the `technologies` array:

```typescript
{
  name: 'Your Technology',
  description: 'Description here',
  category: 'BACKEND', // or FRONTEND, DATABASE, etc.
  displayOrder: 19,
  officialUrl: 'https://example.com',
  iconFileName: 'your-tech.png', // optional
}
```

### Change API URL

Set environment variable:
```bash
API_BASE_URL=http://your-server:port/api/v1 npx ts-node scripts/seed-technologies.ts
```

### Skip Image Upload

Remove the `iconFileName` property from technologies you don't want to upload images for.

## Troubleshooting

### Error: "ADMIN_TOKEN environment variable is required"

You forgot to set the admin token. Follow Step 1 to get the token.

### Error: "Failed to create Technology already exists"

Technologies with duplicate names cannot be created. Either:
- Delete existing technologies first
- Skip the error (script continues with others)

### Error: "Icon file not found"

The script expects icons in `frontend/public/icons/technologies_and_stacks/`. Either:
- Copy icons to that location
- Update the path in the script
- Remove `iconFileName` to skip image upload

### Error: "Failed to upload image"

Check:
- Image file format (should be PNG, JPEG, WebP, or SVG)
- Image file size (max 5MB)
- File permissions

## Manual Creation

If you prefer to create technologies manually via API:

```bash
# Create technology
curl -X POST http://localhost:3001/api/v1/technologies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Node.js",
    "description": "JavaScript runtime",
    "category": "BACKEND",
    "displayOrder": 1,
    "officialUrl": "https://nodejs.org"
  }'

# Upload profile image
curl -X POST http://localhost:3001/api/v1/technologies/1/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "profileImage=@path/to/image.png"
```

## After Seeding

### Update Frontend

Update your frontend to fetch from the API instead of using static data:

```typescript
// Example: frontend/app/page.tsx or a new component
const [technologies, setTechnologies] = useState<Technology[]>([]);

useEffect(() => {
  fetch('http://localhost:3001/api/v1/technologies/query?isActive=true')
    .then(res => res.json())
    .then(data => setTechnologies(data.data))
    .catch(error => console.error('Error loading technologies:', error));
}, []);

// Display technologies
{technologies.map(tech => (
  <div key={tech.id}>
    <img
      src={`http://localhost:3001/api/v1/technologies/${tech.id}/profile-image`}
      alt={tech.name}
      onError={(e) => {
        // Fallback to static image if API fails
        e.currentTarget.src = `/icons/technologies_and_stacks/${tech.name.toLowerCase()}.png`;
      }}
    />
    <h3>{tech.name}</h3>
    <p>{tech.description}</p>
  </div>
))}
```

## Cleanup

To remove all seeded technologies:

```bash
# Get all technologies
curl http://localhost:3001/api/v1/technologies | jq -r '.[] | .id'

# Delete each one (replace IDs)
curl -X DELETE http://localhost:3001/api/v1/technologies/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Or create a cleanup script:

```typescript
const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

for (const id of ids) {
  await fetch(`http://localhost:3001/api/v1/technologies/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
  });
}
```

## Notes

- Technologies are soft deleted by default (can be restored)
- Profile images are automatically optimized (resized to 400x400, compressed)
- All technologies are set to `isActive: true` by default
- Display order can be changed later via UPDATE endpoint
- Cache is automatically invalidated when creating technologies

## Support

If you encounter issues:
1. Check backend logs for detailed error messages
2. Verify database connection
3. Ensure you have admin permissions
4. Check that the backend server is running
5. Verify the API_BASE_URL is correct


# Environment Configuration - JCoder Backend

## Environment Variables

### Development
```env
NODE_ENV=development
BACKEND_PORT=8081
BACKEND_URL=http://localhost:8081
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

### Production
```env
NODE_ENV=production
BACKEND_PORT=8081
BACKEND_URL=https://api.jcoder.com.br
ALLOWED_ORIGINS=https://jcoder.com.br,https://www.jcoder.com.br
```

## Dynamic CORS Configuration

The `SecurityMiddleware` now uses environment variables to configure dynamically:

- **`BACKEND_URL`**: Complete backend URL (e.g., `https://api.jcoder.com.br`)
- **`BACKEND_PORT`**: Backend port (fallback if `BACKEND_URL` is not defined)
- **`ALLOWED_ORIGINS`**: Allowed origins for CORS (comma-separated)

### How It Works

1. **Development**: 
   - `BACKEND_URL=http://localhost:8081`
   - CSP allows images from `http://localhost:8081`

2. **Production**:
   - `BACKEND_URL=https://api.jcoder.com.br`
   - CSP allows images from `https://api.jcoder.com.br`

### Fallback

If `BACKEND_URL` is not defined, the system uses:
```typescript
`http://localhost:${BACKEND_PORT || 8081}`
```

## Deployment Examples

### Docker Compose (Production)
```yaml
environment:
  - NODE_ENV=production
  - BACKEND_URL=https://api.jcoder.com.br
  - ALLOWED_ORIGINS=https://jcoder.com.br,https://www.jcoder.com.br
```

### Environment Variables on Server
```bash
export NODE_ENV=production
export BACKEND_URL=https://api.jcoder.com.br
export ALLOWED_ORIGINS=https://jcoder.com.br,https://www.jcoder.com.br
```

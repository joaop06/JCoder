# Applications Module Tests

Este documento descreve a estrutura de testes para o módulo de aplicações.

## Estrutura de Testes

### Testes Unitários
- **Services**: `applications.service.spec.ts`, `image-upload.service.spec.ts`
- **Use Cases**: `create-application.use-case.spec.ts`, `update-application.use-case.spec.ts`, `delete-application.use-case.spec.ts`
- **DTOs**: `create-application.dto.spec.ts`, `update-application.dto.spec.ts`
- **Exceptions**: `application-not-found.exception.spec.ts`, etc.

### Testes de Integração
- **Module**: `applications.module.spec.ts`
- **Service Integration**: `applications.integration.spec.ts`

### Testes E2E
- **Controller**: `applications.e2e-spec.ts`

## Cobertura de Testes

### Objetivos de Cobertura
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Arquivos com Cobertura
- ✅ Services
- ✅ Use Cases
- ✅ Controllers
- ✅ DTOs (validação)
- ✅ Exceptions
- ✅ Guards
- ✅ Interceptors

### Arquivos Excluídos da Cobertura
- ❌ Entities (apenas estrutura de dados)
- ❌ Enums (apenas constantes)
- ❌ Modules (apenas configuração)
- ❌ Decorators (apenas metadados)
- ❌ Interfaces (apenas tipos)

## Executando os Testes

### Todos os Testes
```bash
npm run test:applications
```

### Testes Unitários
```bash
npm run test:unit:applications
```

### Testes de Integração
```bash
npm run test:integration:applications
```

### Testes E2E
```bash
npm run test:e2e:applications
```

### Cobertura
```bash
npm run test:coverage:applications
```

## Mock Data

### Application Mock
```typescript
const mockApplication = {
  id: 1,
  name: 'Test Application',
  description: 'Test Description',
  applicationType: ApplicationTypeEnum.API,
  userId: 1,
  githubUrl: 'https://github.com/test/app',
  isActive: true,
  images: ['image1.jpg', 'image2.png'],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
```

### User Mock
```typescript
const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashedPassword',
  role: RoleEnum.Admin,
  applications: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
```

## Estrutura de Testes por Arquivo

### Service Tests
- ✅ Métodos públicos
- ✅ Tratamento de erros
- ✅ Validações de entrada
- ✅ Integração com repositório
- ✅ Cache operations

### Use Case Tests
- ✅ Lógica de negócio
- ✅ Validações de regras
- ✅ Integração entre services
- ✅ Tratamento de exceções

### Controller Tests
- ✅ Endpoints HTTP
- ✅ Validação de DTOs
- ✅ Autenticação e autorização
- ✅ Respostas HTTP
- ✅ Upload de arquivos

### DTO Tests
- ✅ Validação de campos obrigatórios
- ✅ Validação de tipos
- ✅ Validação de formatos
- ✅ Transformação de dados

## Configuração de Ambiente

### Variáveis de Teste
```env
NODE_ENV=test
BACKEND_JWT_SECRET=test-jwt-secret
UPLOAD_PATH=./test-uploads
MAX_FILE_SIZE=5242880
```

### Database de Teste
- SQLite em memória
- Sincronização automática
- Limpeza após cada teste

### Cache de Teste
- Cache em memória
- TTL reduzido para testes
- Limpeza automática

## Troubleshooting

### Problemas Comuns
1. **Timeout**: Aumentar timeout para operações de arquivo
2. **Cache**: Limpar cache entre testes
3. **Files**: Limpar arquivos de upload após testes
4. **Database**: Resetar estado entre testes

### Debug
```bash
npm run test:debug:applications
```

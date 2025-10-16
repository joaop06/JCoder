# Users Module - Test Suite

Este documento descreve a suíte de testes completa para o módulo de usuários do backend.

## Estrutura de Testes

### 1. Testes Unitários (`*.spec.ts`)

#### `users.service.spec.ts`
- **Cobertura**: 100% dos métodos do `UsersService`
- **Testa**: 
  - `findById()` - busca por ID válido e inválido
  - `findByEmail()` - busca por email válido e inválido
  - Tratamento de erros e exceções
  - Injeção de dependências
  - Casos extremos (null, undefined, strings vazias)

#### `user-not-found.exception.spec.ts`
- **Cobertura**: 100% da classe de exceção
- **Testa**:
  - Herança de `NotFoundException`
  - Mensagem de erro correta
  - Código de status HTTP (404)
  - Serialização e deserialização
  - Stack trace

#### `user.entity.spec.ts`
- **Cobertura**: 100% da entidade User
- **Testa**:
  - Estrutura da entidade
  - Tipos de propriedades
  - Transformações com class-transformer
  - Exclusão de senha na serialização
  - Soft delete
  - Timestamps automáticos
  - Validação de enums

#### `users.module.spec.ts`
- **Cobertura**: 100% do módulo
- **Testa**:
  - Configuração do módulo
  - Providers e exports
  - Imports do TypeORM
  - Injeção de dependências
  - Isolamento do módulo

### 2. Testes de Integração (`*.integration.spec.ts`)

#### `users.integration.spec.ts`
- **Cobertura**: Operações com banco de dados real
- **Testa**:
  - Operações CRUD com SQLite em memória
  - Transações de banco de dados
  - Soft delete
  - Constraints de unicidade
  - Validação de enums
  - Timestamps automáticos
  - Operações concorrentes
  - Integridade de dados

### 3. Testes E2E (`*.e2e-spec.ts`)

#### `users.e2e-spec.ts`
- **Cobertura**: Integração completa do sistema
- **Testa**:
  - Integração com autenticação
  - Geração de JWT tokens
  - Relacionamentos com aplicações
  - Segurança e validação
  - Performance e escalabilidade
  - Tratamento de erros

### 4. Mocks e Fixtures

#### `user.mocks.ts`
- **Contém**:
  - Dados de teste reutilizáveis
  - Mocks do repositório
  - Mocks do serviço
  - Funções utilitárias
  - Configurações de teste

## Como Executar os Testes

### Executar Todos os Testes do Módulo
```bash
# Testes unitários
npm run test -- --testPathPattern=src/users

# Testes de integração
npm run test -- --testPathPattern=users.integration.spec.ts

# Testes E2E
npm run test:e2e -- --testPathPattern=users.e2e-spec.ts
```

### Executar Testes Específicos
```bash
# Apenas testes unitários do serviço
npm run test -- users.service.spec.ts

# Apenas testes da entidade
npm run test -- user.entity.spec.ts

# Apenas testes de integração
npm run test -- users.integration.spec.ts
```

### Executar com Cobertura
```bash
# Cobertura completa do módulo
npm run test:cov -- --testPathPattern=src/users

# Cobertura detalhada
npm run test:cov -- --testPathPattern=src/users --coverageReporters=html
```

### Executar em Modo Watch
```bash
# Para desenvolvimento
npm run test:watch -- --testPathPattern=src/users
```

## Configuração de Testes

### Variáveis de Ambiente
Os testes usam o arquivo `.env.test` com as seguintes configurações:
- `NODE_ENV=test`
- `BACKEND_JWT_SECRET=test-jwt-secret`
- Banco de dados SQLite em memória

### Configuração Jest
- **Timeout**: 10 segundos para testes unitários, 30 segundos para E2E
- **Cobertura**: Mínimo de 90% em branches, functions, lines e statements
- **Ambiente**: Node.js
- **Setup**: Configuração automática de mocks e fixtures

## Cobertura de Testes

### Métricas de Cobertura
- **Branches**: 90%+
- **Functions**: 90%+
- **Lines**: 90%+
- **Statements**: 90%+

### Arquivos Cobertos
- ✅ `users.service.ts` - 100%
- ✅ `user.entity.ts` - 100%
- ✅ `users.module.ts` - 100%
- ✅ `user-not-found.exception.ts` - 100%

### Cenários Testados
- ✅ Casos de sucesso
- ✅ Casos de erro
- ✅ Casos extremos
- ✅ Validações de entrada
- ✅ Segurança
- ✅ Performance
- ✅ Concorrência

## Estrutura de Dados de Teste

### Usuários de Teste
```typescript
// Usuário padrão
{
  id: 1,
  email: 'test@example.com',
  password: 'hashedPassword',
  role: RoleEnum.User,
  applications: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
}

// Usuário admin
{
  id: 2,
  email: 'admin@example.com',
  password: 'hashedAdminPassword',
  role: RoleEnum.Admin,
  applications: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
}
```

## Troubleshooting

### Problemas Comuns

1. **Timeout nos testes E2E**
   - Verifique se o banco de dados está configurado corretamente
   - Aumente o timeout se necessário

2. **Falhas de cobertura**
   - Execute `npm run test:cov` para ver detalhes
   - Verifique se todos os branches estão sendo testados

3. **Problemas com mocks**
   - Use `resetAllMocks()` entre testes
   - Verifique se os mocks estão configurados corretamente

### Logs de Debug
```bash
# Executar com logs detalhados
npm run test -- --verbose --testPathPattern=src/users

# Executar com debug
npm run test:debug -- --testPathPattern=src/users
```

## Contribuindo

Ao adicionar novos testes:

1. **Siga o padrão de nomenclatura**: `*.spec.ts` para unitários, `*.integration.spec.ts` para integração
2. **Mantenha a cobertura**: Sempre teste casos de sucesso, erro e extremos
3. **Use mocks apropriados**: Para testes unitários, use mocks; para integração, use dados reais
4. **Documente casos complexos**: Adicione comentários explicativos quando necessário
5. **Execute todos os testes**: Sempre execute a suíte completa antes de fazer commit

## Relatórios

Os relatórios de cobertura são gerados em:
- **HTML**: `coverage/users/lcov-report/index.html`
- **LCOV**: `coverage/users/lcov.info`
- **Texto**: Console durante a execução

Para visualizar o relatório HTML:
```bash
open coverage/users/lcov-report/index.html
```

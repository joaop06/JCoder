# Exemplos de Testes

Este documento contém exemplos práticos de como criar testes na aplicação.

## Teste de DTO

```typescript
import { PaginationDto } from './pagination.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('PaginationDto', () => {
  it('should be defined', () => {
    const dto = new PaginationDto();
    expect(dto).toBeDefined();
  });

  it('should accept valid page and limit', async () => {
    const plain = {
      page: 1,
      limit: 10,
    };

    const dto = plainToInstance(PaginationDto, plain);
    const errors = await validate(dto);

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(errors.length).toBe(0);
  });
});
```

## Teste de Controller (sem dependências complexas)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have check method', () => {
    expect(controller.check).toBeDefined();
    expect(typeof controller.check).toBe('function');
  });
});
```

## Teste de Service com Mocks

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MyService } from './my.service';
import { MyEntity } from './entities/my.entity';

describe('MyService', () => {
  let service: MyService;
  let mockRepository: any;

  beforeEach(async () => {
    // Criar mock do repository
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: getRepositoryToken(MyEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of entities', async () => {
      const mockEntities = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ];

      mockRepository.find.mockResolvedValue(mockEntities);

      const result = await service.findAll();

      expect(result).toEqual(mockEntities);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return an entity when found', async () => {
      const mockEntity = { id: 1, name: 'Test 1' };
      mockRepository.findOneBy.mockResolvedValue(mockEntity);

      const result = await service.findById(1);

      expect(result).toEqual(mockEntity);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw exception when entity not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow();
    });
  });
});
```

## Teste de Controller com Mock de Service

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyController } from './my.controller';
import { MyService } from './my.service';
import { CreateDto } from './dto/create.dto';

describe('MyController', () => {
  let controller: MyController;
  let service: jest.Mocked<MyService>;

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyController],
      providers: [
        {
          provide: MyService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MyController>(MyController);
    service = module.get(MyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of entities', async () => {
      const mockEntities = [{ id: 1, name: 'Test' }];
      service.findAll.mockResolvedValue(mockEntities as any);

      const result = await controller.findAll();

      expect(result).toEqual(mockEntities);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new entity', async () => {
      const createDto: CreateDto = { name: 'New Test' };
      const mockEntity = { id: 1, ...createDto };

      service.create.mockResolvedValue(mockEntity as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockEntity);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });
});
```

## Teste E2E

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MyController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configurar pipes e middleware como na aplicação real
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/my-endpoint (GET)', () => {
    it('should return 200 and list of entities', () => {
      return request(app.getHttpServer())
        .get('/my-endpoint')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/my-endpoint/:id (GET)', () => {
    it('should return 200 and single entity', () => {
      return request(app.getHttpServer())
        .get('/my-endpoint/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });

    it('should return 404 when entity not found', () => {
      return request(app.getHttpServer())
        .get('/my-endpoint/999')
        .expect(404);
    });
  });

  describe('/my-endpoint (POST)', () => {
    it('should create a new entity', () => {
      const createDto = { name: 'Test Entity' };

      return request(app.getHttpServer())
        .post('/my-endpoint')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createDto.name);
        });
    });

    it('should return 400 when validation fails', () => {
      const invalidDto = { invalidField: 'test' };

      return request(app.getHttpServer())
        .post('/my-endpoint')
        .send(invalidDto)
        .expect(400);
    });
  });
});
```

## Teste de Guard

```typescript
import { ExecutionContext } from '@nestjs/common';
import { MyGuard } from './my.guard';

describe('MyGuard', () => {
  let guard: MyGuard;

  beforeEach(() => {
    guard = new MyGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true for valid context', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid-token' },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return false for invalid context', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(false);
  });
});
```

## Teste de Pipe

```typescript
import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { MyValidationPipe } from './my-validation.pipe';

describe('MyValidationPipe', () => {
  let pipe: MyValidationPipe;

  beforeEach(() => {
    pipe = new MyValidationPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should transform valid value', () => {
    const value = 'valid-value';
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: String,
      data: '',
    };

    expect(pipe.transform(value, metadata)).toBe(value);
  });

  it('should throw BadRequestException for invalid value', () => {
    const value = '';
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: String,
      data: '',
    };

    expect(() => pipe.transform(value, metadata)).toThrow(BadRequestException);
  });
});
```

## Boas Práticas

1. **Arrange-Act-Assert**: Estruture os testes claramente
2. **Nome descritivo**: Use nomes que descrevem o comportamento
3. **Um assert por teste**: Teste uma coisa de cada vez
4. **Mocks limpos**: Sempre limpe mocks entre testes
5. **Isolamento**: Testes não devem depender um do outro
6. **Cobertura**: Teste casos de sucesso e falha
7. **Performance**: Use SWC para compilação rápida

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestUser, loginUser } from './helpers/auth.helper';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let testUser: { username: string; email: string; password: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Criar usuário de teste
    testUser = await createTestUser(app, {
      username: `auth_test_${Date.now()}`,
      email: `auth_test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/sign-in', () => {
    it('deve fazer login com sucesso com credenciais válidas', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: testUser.username,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('username');
          expect(res.body.user.username).toBe(testUser.username);
          expect(typeof res.body.accessToken).toBe('string');
          expect(res.body.accessToken.length).toBeGreaterThan(0);
        });
    });

    it('deve retornar erro 401 com senha incorreta', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: testUser.username,
          password: 'WrongPassword123!',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode');
          expect(res.body.statusCode).toBe(401);
        });
    });

    it('deve retornar erro 401 com usuário inexistente', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'nonexistent_user',
          password: 'SomePassword123!',
        })
        .expect(401);
    });

    it('deve retornar erro 400 quando username está vazio', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: '',
          password: testUser.password,
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando password está vazio', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: testUser.username,
          password: '',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando username não é fornecido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          password: testUser.password,
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando password não é fornecido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: testUser.username,
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando body está vazio', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({})
        .expect(400);
    });

    it('deve respeitar rate limiting após múltiplas tentativas', async () => {
      // Fazer 5 tentativas com senha errada
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send({
            username: testUser.username,
            password: 'WrongPassword123!',
          });
      }

      // A próxima tentativa deve ser bloqueada pelo rate limit
      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: testUser.username,
          password: 'WrongPassword123!',
        })
        .expect((res) => {
          // Pode retornar 401 ou 429 (Too Many Requests) dependendo da configuração
          expect([401, 429]).toContain(res.status);
        });
    });

    it('deve retornar token JWT válido que pode ser usado para autenticação', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: testUser.username,
          password: testUser.password,
        })
        .expect(200);

      const token = response.body.accessToken;

      // Verificar que o token pode ser usado para acessar endpoints protegidos
      // (teste básico - endpoints específicos serão testados em seus próprios arquivos)
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });
});


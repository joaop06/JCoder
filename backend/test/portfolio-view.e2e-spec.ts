import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestUser, createAndLoginUser, getAuthHeaders } from './helpers/auth.helper';

describe('PortfolioViewController (e2e)', () => {
  let app: INestApplication;
  let testUser: { username: string; email: string; password: string; token?: string; id?: number };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testUser = await createAndLoginUser(app, {
      username: `portfolio_test_${Date.now()}`,
      email: `portfolio_test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/portfolio/check-username/:username', () => {
    it('deve retornar que username está disponível', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/portfolio/check-username/newuser_${Date.now()}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('available');
          expect(res.body.available).toBe(true);
        });
    });

    it('deve retornar que username não está disponível', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/portfolio/check-username/${testUser.username}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('available');
          expect(res.body.available).toBe(false);
        });
    });
  });

  describe('GET /api/v1/portfolio/check-email/:email', () => {
    it('deve retornar que email está disponível', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/portfolio/check-email/newemail_${Date.now()}@example.com`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('available');
          expect(res.body.available).toBe(true);
        });
    });

    it('deve retornar que email não está disponível', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/portfolio/check-email/${testUser.email}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('available');
          expect(res.body.available).toBe(false);
        });
    });
  });

  describe('POST /api/v1/portfolio/send-email-verification', () => {
    it('deve enviar código de verificação para email válido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/portfolio/send-email-verification')
        .send({
          email: `verify_${Date.now()}@example.com`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('deve retornar erro 400 com email inválido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/portfolio/send-email-verification')
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('deve retornar erro quando email já existe', () => {
      return request(app.getHttpServer())
        .post('/api/v1/portfolio/send-email-verification')
        .send({
          email: testUser.email,
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/portfolio/register', () => {
    it('deve criar novo usuário com dados válidos', () => {
      const newUser = {
        username: `newuser_${Date.now()}`,
        email: `newuser_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'New',
        fullName: 'New User',
      };

      return request(app.getHttpServer())
        .post('/api/v1/portfolio/register')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('username');
          expect(res.body).toHaveProperty('email');
          expect(res.body.username).toBe(newUser.username);
          expect(res.body.email).toBe(newUser.email);
        });
    });

    it('deve retornar erro 400 quando username já existe', () => {
      return request(app.getHttpServer())
        .post('/api/v1/portfolio/register')
        .send({
          username: testUser.username,
          email: `different_${Date.now()}@example.com`,
          password: 'TestPassword123!',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando email já existe', () => {
      return request(app.getHttpServer())
        .post('/api/v1/portfolio/register')
        .send({
          username: `different_${Date.now()}`,
          email: testUser.email,
          password: 'TestPassword123!',
        })
        .expect(400);
    });

    it('deve retornar erro 400 com username muito curto', () => {
      return request(app.getHttpServer())
        .post('/api/v1/portfolio/register')
        .send({
          username: 'ab',
          email: `test_${Date.now()}@example.com`,
          password: 'TestPassword123!',
        })
        .expect(400);
    });

    it('deve retornar erro 400 com username com caracteres inválidos', () => {
      return request(app.getHttpServer())
        .post('/api/v1/portfolio/register')
        .send({
          username: 'user@name',
          email: `test_${Date.now()}@example.com`,
          password: 'TestPassword123!',
        })
        .expect(400);
    });

    it('deve retornar erro 400 com email inválido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/portfolio/register')
        .send({
          username: `test_${Date.now()}`,
          email: 'invalid-email',
          password: 'TestPassword123!',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/portfolio/:username/profile', () => {
    it('deve retornar perfil do usuário', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/portfolio/${testUser.username}/profile`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('username');
          expect(res.body.username).toBe(testUser.username);
        });
    });

    it('deve retornar erro 404 para usuário inexistente', () => {
      return request(app.getHttpServer())
        .get('/api/v1/portfolio/nonexistent_user/profile')
        .expect(404);
    });
  });

  describe('GET /api/v1/portfolio/:username/educations', () => {
    it('deve retornar lista de educações (pode estar vazia)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/portfolio/${testUser.username}/educations`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('deve retornar erro 404 para usuário inexistente', () => {
      return request(app.getHttpServer())
        .get('/api/v1/portfolio/nonexistent_user/educations')
        .expect(404);
    });
  });

  describe('GET /api/v1/portfolio/:username/experiences', () => {
    it('deve retornar lista de experiências (pode estar vazia)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/portfolio/${testUser.username}/experiences`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/portfolio/:username/certificates', () => {
    it('deve retornar lista de certificados (pode estar vazia)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/portfolio/${testUser.username}/certificates`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/portfolio/:username/applications', () => {
    it('deve retornar lista de aplicações (pode estar vazia)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/portfolio/${testUser.username}/applications`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/portfolio/:username/technologies', () => {
    it('deve retornar lista de tecnologias (pode estar vazia)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/portfolio/${testUser.username}/technologies`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/portfolio/:username/references', () => {
    it('deve retornar lista de referências (pode estar vazia)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/portfolio/${testUser.username}/references`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('POST /api/v1/portfolio/:username/messages', () => {
    it('deve criar mensagem com dados válidos', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/portfolio/${testUser.username}/messages`)
        .send({
          name: 'Test Sender',
          email: 'sender@example.com',
          message: 'This is a test message',
        })
        .expect(204);
    });

    it('deve retornar erro 400 quando name está vazio', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/portfolio/${testUser.username}/messages`)
        .send({
          name: '',
          email: 'sender@example.com',
          message: 'This is a test message',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando email é inválido', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/portfolio/${testUser.username}/messages`)
        .send({
          name: 'Test Sender',
          email: 'invalid-email',
          message: 'This is a test message',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando message está vazio', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/portfolio/${testUser.username}/messages`)
        .send({
          name: 'Test Sender',
          email: 'sender@example.com',
          message: '',
        })
        .expect(400);
    });

    it('deve retornar erro 404 para usuário inexistente', () => {
      return request(app.getHttpServer())
        .post('/api/v1/portfolio/nonexistent_user/messages')
        .send({
          name: 'Test Sender',
          email: 'sender@example.com',
          message: 'This is a test message',
        })
        .expect(404);
    });
  });

  describe('POST /api/v1/portfolio/:username/track-view', () => {
    it('deve registrar visualização do portfólio', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/portfolio/${testUser.username}/track-view`)
        .send({
          referrer: 'https://example.com',
        })
        .expect(204);
    });

    it('deve registrar visualização sem referrer', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/portfolio/${testUser.username}/track-view`)
        .send({})
        .expect(204);
    });

    it('deve retornar erro 404 para usuário inexistente', () => {
      return request(app.getHttpServer())
        .post('/api/v1/portfolio/nonexistent_user/track-view')
        .send({
          referrer: 'https://example.com',
        })
        .expect(404);
    });
  });
});


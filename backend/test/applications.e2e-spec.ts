import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createAndLoginUser, getAuthHeaders } from './helpers/auth.helper';

describe('ApplicationsController (e2e)', () => {
  let app: INestApplication;
  let testUser: { username: string; email: string; password: string; token?: string; id?: number };
  let createdApplicationId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testUser = await createAndLoginUser(app, {
      username: `apps_test_${Date.now()}`,
      email: `apps_test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/:username/applications', () => {
    it('deve retornar lista de aplicações (pode estar vazia)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/applications`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('deve retornar lista paginada com parâmetros de paginação', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/applications`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(10);
        });
    });
  });

  describe('GET /api/v1/:username/applications/stats', () => {
    it('deve retornar estatísticas de aplicações', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/applications/stats`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('active');
          expect(res.body).toHaveProperty('deleted');
          expect(typeof res.body.total).toBe('number');
        });
    });
  });

  describe('POST /api/v1/:username/applications', () => {
    it('deve criar nova aplicação com dados válidos', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'Test Application',
          description: 'This is a test application',
          githubUrl: 'https://github.com/test/app',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body.name).toBe('Test Application');
          createdApplicationId = res.body.id;
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .send({
          userId: testUser.id,
          name: 'Test Application',
          description: 'This is a test application',
        })
        .expect(401);
    });

    it('deve retornar erro 400 quando name está vazio', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: '',
          description: 'This is a test application',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando description está vazio', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'Test Application',
          description: '',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando userId não é fornecido', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: 'Test Application',
          description: 'This is a test application',
        })
        .expect(400);
    });

    it('deve retornar erro 400 com githubUrl inválido', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'Test Application',
          description: 'This is a test application',
          githubUrl: 'invalid-url',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/:username/applications/:id', () => {
    it('deve retornar aplicação por ID', async () => {
      // Criar aplicação primeiro
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'Get Test Application',
          description: 'This is a test application',
        })
        .expect(201);

      const appId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/applications/${appId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe(appId);
          expect(res.body.name).toBe('Get Test Application');
        });
    });

    it('deve retornar erro 404 para aplicação inexistente', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/applications/99999`)
        .expect(404);
    });
  });

  describe('PUT /api/v1/:username/applications/:id', () => {
    it('deve atualizar aplicação existente', async () => {
      // Criar aplicação primeiro
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'Update Test Application',
          description: 'This is a test application',
        })
        .expect(201);

      const appId = createResponse.body.id;

      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/applications/${appId}`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: 'Updated Application Name',
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Application Name');
          expect(res.body.description).toBe('Updated description');
        });
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'Test Application',
          description: 'This is a test application',
        })
        .expect(201);

      const appId = createResponse.body.id;

      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/applications/${appId}`)
        .send({
          name: 'Updated Application Name',
        })
        .expect(401);
    });

    it('deve retornar erro 404 para aplicação inexistente', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/applications/99999`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: 'Updated Application Name',
        })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/:username/applications/:id', () => {
    it('deve deletar aplicação existente', async () => {
      // Criar aplicação primeiro
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'Delete Test Application',
          description: 'This is a test application',
        })
        .expect(201);

      const appId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/applications/${appId}`)
        .set(getAuthHeaders(testUser.token!))
        .expect(204);
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'Test Application',
          description: 'This is a test application',
        })
        .expect(201);

      const appId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/applications/${appId}`)
        .expect(401);
    });

    it('deve retornar erro 404 para aplicação inexistente', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/applications/99999`)
        .set(getAuthHeaders(testUser.token!))
        .expect(404);
    });
  });

  describe('PUT /api/v1/:username/applications/:id/reorder', () => {
    it('deve reordenar aplicação', async () => {
      // Criar duas aplicações
      const app1 = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'App 1',
          description: 'First application',
        })
        .expect(201);

      const app2 = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'App 2',
          description: 'Second application',
        })
        .expect(201);

      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/applications/${app1.body.id}/reorder`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          newOrder: 2,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('order');
        });
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'Test Application',
          description: 'This is a test application',
        })
        .expect(201);

      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/applications/${createResponse.body.id}/reorder`)
        .send({
          newOrder: 1,
        })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/:username/applications/:id/components/:componentType', () => {
    it('deve deletar componente API da aplicação', async () => {
      // Criar aplicação com componente API primeiro seria necessário
      // Por enquanto, testamos apenas o endpoint
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'Test Application',
          description: 'This is a test application',
        })
        .expect(201);

      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/applications/${createResponse.body.id}/components/api`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200);
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/applications`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          userId: testUser.id,
          name: 'Test Application',
          description: 'This is a test application',
        })
        .expect(201);

      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/applications/${createResponse.body.id}/components/api`)
        .expect(401);
    });
  });
});


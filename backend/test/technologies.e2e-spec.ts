import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createAndLoginUser, getAuthHeaders } from './helpers/auth.helper';

describe('TechnologiesController (e2e)', () => {
  let app: INestApplication;
  let testUser: { username: string; email: string; password: string; token?: string; id?: number };
  let createdTechnologyId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testUser = await createAndLoginUser(app, {
      username: `tech_test_${Date.now()}`,
      email: `tech_test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/:username/technologies', () => {
    it('deve retornar lista de tecnologias (pode estar vazia)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/technologies`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('deve retornar lista paginada com parâmetros de paginação', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/technologies`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(10);
        });
    });
  });

  describe('GET /api/v1/:username/technologies/stats', () => {
    it('deve retornar estatísticas de tecnologias', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/technologies/stats`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('active');
          expect(res.body).toHaveProperty('deleted');
          expect(typeof res.body.total).toBe('number');
        });
    });
  });

  describe('POST /api/v1/:username/technologies', () => {
    it('deve criar nova tecnologia com dados válidos', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: `Test Technology ${Date.now()}`,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          createdTechnologyId = res.body.id;
        });
    });

    it('deve criar tecnologia com expertiseLevel', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: `Expert Tech ${Date.now()}`,
          expertiseLevel: 'INTERMEDIATE',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('expertiseLevel');
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .send({
          name: 'Test Technology',
        })
        .expect(401);
    });

    it('deve retornar erro 400 quando name está vazio', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: '',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando name não é fornecido', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({})
        .expect(400);
    });

    it('deve retornar erro 400 com expertiseLevel inválido', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: 'Test Technology',
          expertiseLevel: 'INVALID_LEVEL',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/:username/technologies/:id', () => {
    it('deve retornar tecnologia por ID', async () => {
      // Criar tecnologia primeiro
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: `Get Test Technology ${Date.now()}`,
        })
        .expect(201);

      const techId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/technologies/${techId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe(techId);
        });
    });

    it('deve retornar erro 404 para tecnologia inexistente', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/technologies/99999`)
        .expect(404);
    });
  });

  describe('PUT /api/v1/:username/technologies/:id', () => {
    it('deve atualizar tecnologia existente', async () => {
      // Criar tecnologia primeiro
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: `Update Test Technology ${Date.now()}`,
        })
        .expect(201);

      const techId = createResponse.body.id;

      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/technologies/${techId}`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: 'Updated Technology Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Technology Name');
        });
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: `Test Technology ${Date.now()}`,
        })
        .expect(201);

      const techId = createResponse.body.id;

      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/technologies/${techId}`)
        .send({
          name: 'Updated Technology Name',
        })
        .expect(401);
    });

    it('deve retornar erro 404 para tecnologia inexistente', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/technologies/99999`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: 'Updated Technology Name',
        })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/:username/technologies/:id', () => {
    it('deve deletar tecnologia existente', async () => {
      // Criar tecnologia primeiro
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: `Delete Test Technology ${Date.now()}`,
        })
        .expect(201);

      const techId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/technologies/${techId}`)
        .set(getAuthHeaders(testUser.token!))
        .expect(204);
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: `Test Technology ${Date.now()}`,
        })
        .expect(201);

      const techId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/technologies/${techId}`)
        .expect(401);
    });

    it('deve retornar erro 404 para tecnologia inexistente', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/technologies/99999`)
        .set(getAuthHeaders(testUser.token!))
        .expect(404);
    });
  });

  describe('PUT /api/v1/:username/technologies/:id/reorder', () => {
    it('deve reordenar tecnologia', async () => {
      // Criar duas tecnologias
      const tech1 = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: `Tech 1 ${Date.now()}`,
        })
        .expect(201);

      const tech2 = await request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: `Tech 2 ${Date.now()}`,
        })
        .expect(201);

      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/technologies/${tech1.body.id}/reorder`)
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
        .post(`/api/v1/${testUser.username}/technologies`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: `Test Technology ${Date.now()}`,
        })
        .expect(201);

      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/technologies/${createResponse.body.id}/reorder`)
        .send({
          newOrder: 1,
        })
        .expect(401);
    });
  });
});


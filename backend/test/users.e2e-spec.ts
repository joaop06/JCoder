import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createAndLoginUser, getAuthHeaders } from './helpers/auth.helper';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let testUser: { username: string; email: string; password: string; token?: string; id?: number };
  let otherUser: { username: string; email: string; password: string; token?: string; id?: number };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testUser = await createAndLoginUser(app, {
      username: `users_test_${Date.now()}`,
      email: `users_test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    otherUser = await createAndLoginUser(app, {
      username: `other_user_${Date.now()}`,
      email: `other_user_${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/:username/users/profile', () => {
    it('deve retornar perfil do usuário autenticado', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/users/profile`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('username');
          expect(res.body.username).toBe(testUser.username);
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/users/profile`)
        .expect(401);
    });

    it('deve retornar erro 403 quando tenta acessar perfil de outro usuário', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${otherUser.username}/users/profile`)
        .set(getAuthHeaders(testUser.token!))
        .expect(403);
    });
  });

  describe('PATCH /api/v1/:username/users/profile', () => {
    it('deve atualizar perfil do usuário', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/${testUser.username}/users/profile`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          firstName: 'Updated',
          fullName: 'Updated Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.firstName).toBe('Updated');
          expect(res.body.fullName).toBe('Updated Name');
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/${testUser.username}/users/profile`)
        .send({
          firstName: 'Updated',
        })
        .expect(401);
    });

    it('deve retornar erro 403 quando tenta atualizar perfil de outro usuário', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/${otherUser.username}/users/profile`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          firstName: 'Updated',
        })
        .expect(403);
    });
  });

  describe('GET /api/v1/:username/users/about-me', () => {
    it('deve retornar about-me do usuário', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/users/about-me`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200);
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/users/about-me`)
        .expect(401);
    });
  });

  describe('PATCH /api/v1/:username/users/about-me', () => {
    it('deve atualizar about-me do usuário', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/${testUser.username}/users/about-me`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          content: '<p>This is my updated about me content</p>',
        })
        .expect(200);
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/${testUser.username}/users/about-me`)
        .send({
          content: '<p>Content</p>',
        })
        .expect(401);
    });
  });

  describe('Educations CRUD', () => {
    let educationId: number;

    it('deve criar nova educação', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/users/educations`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          institutionName: 'Test University',
          courseName: 'Computer Science',
          degree: 'Bachelor',
          startDate: new Date('2020-01-01'),
          isCurrentlyStudying: false,
          endDate: new Date('2024-12-31'),
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.institutionName).toBe('Test University');
          educationId = res.body.id;
        });
    });

    it('deve listar educações do usuário', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/users/educations`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('deve atualizar educação existente', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/users/educations/${educationId}`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          institutionName: 'Updated University',
          courseName: 'Updated Course',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.institutionName).toBe('Updated University');
        });
    });

    it('deve deletar educação existente', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/users/educations/${educationId}`)
        .set(getAuthHeaders(testUser.token!))
        .expect(204);
    });

    it('deve retornar erro 400 com datas inválidas', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/users/educations`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          institutionName: 'Test University',
          courseName: 'Computer Science',
          startDate: new Date('2024-12-31'),
          endDate: new Date('2020-01-01'), // End date before start date
          isCurrentlyStudying: false,
        })
        .expect(400);
    });
  });

  describe('Experiences CRUD', () => {
    let experienceId: number;

    it('deve criar nova experiência', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/users/experiences`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          companyName: 'Test Company',
          position: 'Software Engineer',
          startDate: new Date('2020-01-01'),
          isCurrentlyWorking: false,
          endDate: new Date('2024-12-31'),
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.companyName).toBe('Test Company');
          experienceId = res.body.id;
        });
    });

    it('deve listar experiências do usuário', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/users/experiences`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('deve atualizar experiência existente', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/users/experiences/${experienceId}`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          companyName: 'Updated Company',
          position: 'Senior Software Engineer',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.companyName).toBe('Updated Company');
        });
    });

    it('deve deletar experiência existente', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/users/experiences/${experienceId}`)
        .set(getAuthHeaders(testUser.token!))
        .expect(204);
    });
  });

  describe('Certificates CRUD', () => {
    let certificateId: number;

    it('deve criar novo certificado', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/users/certificates`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: 'Test Certificate',
          issuer: 'Test Issuer',
          issueDate: new Date('2024-01-01'),
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Certificate');
          certificateId = res.body.id;
        });
    });

    it('deve listar certificados do usuário', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/users/certificates`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('deve atualizar certificado existente', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/users/certificates/${certificateId}`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: 'Updated Certificate',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Certificate');
        });
    });

    it('deve deletar certificado existente', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/users/certificates/${certificateId}`)
        .set(getAuthHeaders(testUser.token!))
        .expect(204);
    });
  });

  describe('References CRUD', () => {
    let referenceId: number;

    it('deve criar nova referência', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${testUser.username}/users/references`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: 'Test Reference',
          position: 'Manager',
          company: 'Test Company',
          email: 'reference@example.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Reference');
          referenceId = res.body.id;
        });
    });

    it('deve listar referências do usuário', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/users/references`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('deve atualizar referência existente', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/${testUser.username}/users/references/${referenceId}`)
        .set(getAuthHeaders(testUser.token!))
        .send({
          name: 'Updated Reference',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Reference');
        });
    });

    it('deve deletar referência existente', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/${testUser.username}/users/references/${referenceId}`)
        .set(getAuthHeaders(testUser.token!))
        .expect(204);
    });
  });
});


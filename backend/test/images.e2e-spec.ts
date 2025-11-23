import request from 'supertest';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createAndLoginUser, getAuthHeaders } from './helpers/auth.helper';

describe('ImagesController (e2e)', () => {
  let app: INestApplication;
  let testUser: { username: string; email: string; password: string; token?: string; id?: number };
  let applicationId: number;
  let technologyId: number;
  let certificateId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testUser = await createAndLoginUser(app, {
      username: `images_test_${Date.now()}`,
      email: `images_test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    // Criar aplicação para testes
    const appResponse = await request(app.getHttpServer())
      .post(`/api/v1/${testUser.username}/applications`)
      .set(getAuthHeaders(testUser.token!))
      .send({
        userId: testUser.id,
        name: 'Test Application for Images',
        description: 'Test application',
      })
      .expect(201);
    applicationId = appResponse.body.id;

    // Criar tecnologia para testes
    const techResponse = await request(app.getHttpServer())
      .post(`/api/v1/${testUser.username}/technologies`)
      .set(getAuthHeaders(testUser.token!))
      .send({
        name: `Test Tech ${Date.now()}`,
      })
      .expect(201);
    technologyId = techResponse.body.id;

    // Criar certificado para testes
    const certResponse = await request(app.getHttpServer())
      .post(`/api/v1/${testUser.username}/users/certificates`)
      .set(getAuthHeaders(testUser.token!))
      .send({
        name: 'Test Certificate',
        issuer: 'Test Issuer',
        issueDate: new Date('2024-01-01'),
      })
      .expect(201);
    certificateId = certResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Application Images', () => {
    describe('POST /api/v1/:username/images/applications/:id/profile-image', () => {
      it('deve retornar erro 401 sem token de autenticação', () => {
        return request(app.getHttpServer())
          .post(`/api/v1/${testUser.username}/images/applications/${applicationId}/profile-image`)
          .expect(401);
      });

      it('deve retornar erro 400 quando nenhum arquivo é enviado', () => {
        return request(app.getHttpServer())
          .post(`/api/v1/${testUser.username}/images/applications/${applicationId}/profile-image`)
          .set(getAuthHeaders(testUser.token!))
          .expect(400);
      });

      it('deve retornar erro 404 para aplicação inexistente', () => {
        return request(app.getHttpServer())
          .post(`/api/v1/${testUser.username}/images/applications/99999/profile-image`)
          .set(getAuthHeaders(testUser.token!))
          .attach('profileImage', Buffer.from('fake image'), 'test.jpg')
          .expect(404);
      });
    });

    describe('PUT /api/v1/:username/images/applications/:id/profile-image', () => {
      it('deve retornar erro 401 sem token de autenticação', () => {
        return request(app.getHttpServer())
          .put(`/api/v1/${testUser.username}/images/applications/${applicationId}/profile-image`)
          .expect(401);
      });

      it('deve retornar erro 404 para aplicação inexistente', () => {
        return request(app.getHttpServer())
          .put(`/api/v1/${testUser.username}/images/applications/99999/profile-image`)
          .set(getAuthHeaders(testUser.token!))
          .attach('profileImage', Buffer.from('fake image'), 'test.jpg')
          .expect(404);
      });
    });

    describe('GET /api/v1/:username/images/applications/:id/profile-image', () => {
      it('deve retornar erro 404 quando imagem não existe', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/${testUser.username}/images/applications/${applicationId}/profile-image`)
          .expect(404);
      });

      it('deve retornar erro 404 para aplicação inexistente', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/${testUser.username}/images/applications/99999/profile-image`)
          .expect(404);
      });
    });

    describe('DELETE /api/v1/:username/images/applications/:id/profile-image', () => {
      it('deve retornar erro 401 sem token de autenticação', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/${testUser.username}/images/applications/${applicationId}/profile-image`)
          .expect(401);
      });

      it('deve retornar erro 404 para aplicação inexistente', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/${testUser.username}/images/applications/99999/profile-image`)
          .set(getAuthHeaders(testUser.token!))
          .expect(404);
      });
    });

    describe('POST /api/v1/:username/images/applications/:id', () => {
      it('deve retornar erro 401 sem token de autenticação', () => {
        return request(app.getHttpServer())
          .post(`/api/v1/${testUser.username}/images/applications/${applicationId}`)
          .expect(401);
      });

      it('deve retornar erro 404 para aplicação inexistente', () => {
        return request(app.getHttpServer())
          .post(`/api/v1/${testUser.username}/images/applications/99999`)
          .set(getAuthHeaders(testUser.token!))
          .attach('images', Buffer.from('fake image'), 'test.jpg')
          .expect(404);
      });
    });

    describe('GET /api/v1/:username/images/applications/:id/:filename', () => {
      it('deve retornar erro 404 quando imagem não existe', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/${testUser.username}/images/applications/${applicationId}/nonexistent.jpg`)
          .expect(404);
      });

      it('deve retornar erro 404 para aplicação inexistente', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/${testUser.username}/images/applications/99999/test.jpg`)
          .expect(404);
      });
    });

    describe('DELETE /api/v1/:username/images/applications/:id/:filename', () => {
      it('deve retornar erro 401 sem token de autenticação', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/${testUser.username}/images/applications/${applicationId}/test.jpg`)
          .expect(401);
      });

      it('deve retornar erro 404 para aplicação inexistente', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/${testUser.username}/images/applications/99999/test.jpg`)
          .set(getAuthHeaders(testUser.token!))
          .expect(404);
      });
    });
  });

  describe('Technology Images', () => {
    describe('POST /api/v1/:username/images/technologies/:id/profile-image', () => {
      it('deve retornar erro 401 sem token de autenticação', () => {
        return request(app.getHttpServer())
          .post(`/api/v1/${testUser.username}/images/technologies/${technologyId}/profile-image`)
          .expect(401);
      });

      it('deve retornar erro 404 para tecnologia inexistente', () => {
        return request(app.getHttpServer())
          .post(`/api/v1/${testUser.username}/images/technologies/99999/profile-image`)
          .set(getAuthHeaders(testUser.token!))
          .attach('profileImage', Buffer.from('fake image'), 'test.jpg')
          .expect(404);
      });
    });

    describe('GET /api/v1/:username/images/technologies/:id/profile-image', () => {
      it('deve retornar erro 404 quando imagem não existe', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/${testUser.username}/images/technologies/${technologyId}/profile-image`)
          .expect(404);
      });

      it('deve retornar erro 404 para tecnologia inexistente', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/${testUser.username}/images/technologies/99999/profile-image`)
          .expect(404);
      });
    });

    describe('DELETE /api/v1/:username/images/technologies/:id/profile-image', () => {
      it('deve retornar erro 401 sem token de autenticação', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/${testUser.username}/images/technologies/${technologyId}/profile-image`)
          .expect(401);
      });

      it('deve retornar erro 404 para tecnologia inexistente', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/${testUser.username}/images/technologies/99999/profile-image`)
          .set(getAuthHeaders(testUser.token!))
          .expect(404);
      });
    });
  });

  describe('User Images', () => {
    describe('POST /api/v1/:username/images/users/:id/profile-image', () => {
      it('deve retornar erro 401 sem token de autenticação', () => {
        return request(app.getHttpServer())
          .post(`/api/v1/${testUser.username}/images/users/${testUser.id}/profile-image`)
          .expect(401);
      });

      it('deve retornar erro 404 para usuário inexistente', () => {
        return request(app.getHttpServer())
          .post(`/api/v1/${testUser.username}/images/users/99999/profile-image`)
          .set(getAuthHeaders(testUser.token!))
          .attach('profileImage', Buffer.from('fake image'), 'test.jpg')
          .expect(404);
      });
    });

    describe('GET /api/v1/:username/images/users/:id/profile-image', () => {
      it('deve retornar erro 404 quando imagem não existe', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/${testUser.username}/images/users/${testUser.id}/profile-image`)
          .expect(404);
      });

      it('deve retornar erro 404 para usuário inexistente', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/${testUser.username}/images/users/99999/profile-image`)
          .expect(404);
      });
    });

    describe('DELETE /api/v1/:username/images/users/:id/profile-image', () => {
      it('deve retornar erro 401 sem token de autenticação', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/${testUser.username}/images/users/${testUser.id}/profile-image`)
          .expect(401);
      });

      it('deve retornar erro 404 para usuário inexistente', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/${testUser.username}/images/users/99999/profile-image`)
          .set(getAuthHeaders(testUser.token!))
          .expect(404);
      });
    });
  });

  describe('Certificate Images', () => {
    describe('POST /api/v1/:username/images/users/certificates/:certificateId/image', () => {
      it('deve retornar erro 401 sem token de autenticação', () => {
        return request(app.getHttpServer())
          .post(`/api/v1/${testUser.username}/images/users/certificates/${certificateId}/image`)
          .expect(401);
      });

      it('deve retornar erro 404 para certificado inexistente', () => {
        return request(app.getHttpServer())
          .post(`/api/v1/${testUser.username}/images/users/certificates/99999/image`)
          .set(getAuthHeaders(testUser.token!))
          .attach('certificateImage', Buffer.from('fake image'), 'test.jpg')
          .expect(404);
      });
    });

    describe('GET /api/v1/:username/images/users/certificates/:certificateId/image', () => {
      it('deve retornar erro 404 quando imagem não existe', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/${testUser.username}/images/users/certificates/${certificateId}/image`)
          .expect(404);
      });

      it('deve retornar erro 404 para certificado inexistente', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/${testUser.username}/images/users/certificates/99999/image`)
          .expect(404);
      });
    });

    describe('DELETE /api/v1/:username/images/users/certificates/:certificateId/image', () => {
      it('deve retornar erro 401 sem token de autenticação', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/${testUser.username}/images/users/certificates/${certificateId}/image`)
          .expect(401);
      });

      it('deve retornar erro 404 para certificado inexistente', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/${testUser.username}/images/users/certificates/99999/image`)
          .set(getAuthHeaders(testUser.token!))
          .expect(404);
      });
    });
  });
});


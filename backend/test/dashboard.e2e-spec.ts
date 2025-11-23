import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createAndLoginUser, getAuthHeaders } from './helpers/auth.helper';

describe('DashboardController (e2e)', () => {
  let app: INestApplication;
  let testUser: { username: string; email: string; password: string; token?: string; id?: number };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testUser = await createAndLoginUser(app, {
      username: `dashboard_test_${Date.now()}`,
      email: `dashboard_test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/:username/dashboard/applications/stats', () => {
    it('deve retornar estatísticas de aplicações', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/dashboard/applications/stats`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('active');
          expect(res.body).toHaveProperty('deleted');
          expect(typeof res.body.total).toBe('number');
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/dashboard/applications/stats`)
        .expect(401);
    });
  });

  describe('GET /api/v1/:username/dashboard/technologies/stats', () => {
    it('deve retornar estatísticas de tecnologias', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/dashboard/technologies/stats`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('active');
          expect(res.body).toHaveProperty('deleted');
          expect(typeof res.body.total).toBe('number');
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/dashboard/technologies/stats`)
        .expect(401);
    });
  });

  describe('GET /api/v1/:username/dashboard/messages/unread', () => {
    it('deve retornar estatísticas de mensagens não lidas', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/dashboard/messages/unread`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('unreadCount');
          expect(typeof res.body.unreadCount).toBe('number');
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/dashboard/messages/unread`)
        .expect(401);
    });
  });

  describe('GET /api/v1/:username/dashboard/profile/completeness', () => {
    it('deve retornar completude do perfil', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/dashboard/profile/completeness`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('completeness');
          expect(typeof res.body.completeness).toBe('number');
          expect(res.body.completeness).toBeGreaterThanOrEqual(0);
          expect(res.body.completeness).toBeLessThanOrEqual(100);
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/dashboard/profile/completeness`)
        .expect(401);
    });
  });

  describe('GET /api/v1/:username/dashboard/engagement/stats', () => {
    it('deve retornar estatísticas de engajamento do portfólio', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/dashboard/engagement/stats`)
        .set(getAuthHeaders(testUser.token!))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalViews');
          expect(res.body).toHaveProperty('uniqueVisitors');
          expect(typeof res.body.totalViews).toBe('number');
          expect(typeof res.body.uniqueVisitors).toBe('number');
        });
    });

    it('deve retornar estatísticas com query parameters de data', () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/dashboard/engagement/stats`)
        .set(getAuthHeaders(testUser.token!))
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalViews');
          expect(res.body).toHaveProperty('uniqueVisitors');
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${testUser.username}/dashboard/engagement/stats`)
        .expect(401);
    });
  });
});


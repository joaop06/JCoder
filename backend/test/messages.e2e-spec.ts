import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createAndLoginUser, createTestUser, getAuthHeaders } from './helpers/auth.helper';

describe('MessagesController (e2e)', () => {
  let app: INestApplication;
  let adminUser: { username: string; email: string; password: string; token?: string; id?: number };
  let messageId: number;
  let conversationId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    adminUser = await createAndLoginUser(app, {
      username: `admin_messages_${Date.now()}`,
      email: `admin_messages_${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/portfolio/:username/messages (criar mensagem pública)', () => {
    it('deve criar mensagem para o administrador', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/portfolio/${adminUser.username}/messages`)
        .send({
          name: 'Test Sender',
          email: 'sender@example.com',
          message: 'This is a test message',
        })
        .expect(204);
    });

    it('deve retornar erro 400 quando name está vazio', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/portfolio/${adminUser.username}/messages`)
        .send({
          name: '',
          email: 'sender@example.com',
          message: 'This is a test message',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando email é inválido', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/portfolio/${adminUser.username}/messages`)
        .send({
          name: 'Test Sender',
          email: 'invalid-email',
          message: 'This is a test message',
        })
        .expect(400);
    });

    it('deve retornar erro 400 quando message está vazio', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/portfolio/${adminUser.username}/messages`)
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

  describe('GET /api/v1/:username/messages/conversations', () => {
    beforeEach(async () => {
      // Criar uma mensagem antes de testar conversas
      await request(app.getHttpServer())
        .post(`/api/v1/portfolio/${adminUser.username}/messages`)
        .send({
          name: 'Conversation Test',
          email: 'conversation@example.com',
          message: 'Test message for conversation',
        });
    });

    it('deve listar todas as conversas do administrador', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages/conversations`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('senderName');
            expect(res.body[0]).toHaveProperty('senderEmail');
            conversationId = res.body[0].id;
          }
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages/conversations`)
        .expect(401);
    });

    it('deve retornar erro 403 quando outro usuário tenta acessar', async () => {
      const otherUser = await createAndLoginUser(app, {
        username: `other_user_${Date.now()}`,
        email: `other_user_${Date.now()}@example.com`,
        password: 'TestPassword123!',
      });

      return request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages/conversations`)
        .set(getAuthHeaders(otherUser.token!))
        .expect(403);
    });
  });

  describe('GET /api/v1/:username/messages/conversations/:conversationId/messages', () => {
    beforeEach(async () => {
      // Criar uma mensagem e obter conversationId
      await request(app.getHttpServer())
        .post(`/api/v1/portfolio/${adminUser.username}/messages`)
        .send({
          name: 'Message Test',
          email: 'messagetest@example.com',
          message: 'Test message',
        });

      const conversationsResponse = await request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages/conversations`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(200);

      if (conversationsResponse.body.length > 0) {
        conversationId = conversationsResponse.body[0].id;
      }
    });

    it('deve retornar mensagens de uma conversa específica', () => {
      if (!conversationId) {
        return;
      }

      return request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages/conversations/${conversationId}/messages`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('message');
            messageId = res.body[0].id;
          }
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      if (!conversationId) {
        return;
      }

      return request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages/conversations/${conversationId}/messages`)
        .expect(401);
    });

    it('deve retornar erro 404 para conversa inexistente', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages/conversations/99999/messages`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(404);
    });
  });

  describe('POST /api/v1/:username/messages/conversations/:conversationId/mark-read', () => {
    beforeEach(async () => {
      // Criar uma mensagem e obter IDs
      await request(app.getHttpServer())
        .post(`/api/v1/portfolio/${adminUser.username}/messages`)
        .send({
          name: 'Mark Read Test',
          email: 'markread@example.com',
          message: 'Test message for mark read',
        });

      const conversationsResponse = await request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages/conversations`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(200);

      if (conversationsResponse.body.length > 0) {
        conversationId = conversationsResponse.body[0].id;

        const messagesResponse = await request(app.getHttpServer())
          .get(`/api/v1/${adminUser.username}/messages/conversations/${conversationId}/messages`)
          .set(getAuthHeaders(adminUser.token!))
          .expect(200);

        if (messagesResponse.body.length > 0) {
          messageId = messagesResponse.body[0].id;
        }
      }
    });

    it('deve marcar mensagens como lidas', () => {
      if (!conversationId || !messageId) {
        return;
      }

      return request(app.getHttpServer())
        .post(`/api/v1/${adminUser.username}/messages/conversations/${conversationId}/mark-read`)
        .set(getAuthHeaders(adminUser.token!))
        .send({
          messageIds: [messageId],
        })
        .expect(204);
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      if (!conversationId || !messageId) {
        return;
      }

      return request(app.getHttpServer())
        .post(`/api/v1/${adminUser.username}/messages/conversations/${conversationId}/mark-read`)
        .send({
          messageIds: [messageId],
        })
        .expect(401);
    });

    it('deve retornar erro 404 para conversa inexistente', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/${adminUser.username}/messages/conversations/99999/mark-read`)
        .set(getAuthHeaders(adminUser.token!))
        .send({
          messageIds: [1],
        })
        .expect(404);
    });
  });

  describe('GET /api/v1/:username/messages', () => {
    it('deve listar todas as mensagens do administrador', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages`)
        .expect(401);
    });
  });

  describe('GET /api/v1/:username/messages/:id', () => {
    beforeEach(async () => {
      // Criar uma mensagem e obter ID
      await request(app.getHttpServer())
        .post(`/api/v1/portfolio/${adminUser.username}/messages`)
        .send({
          name: 'Get Test',
          email: 'gettest@example.com',
          message: 'Test message for get',
        });

      const messagesResponse = await request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(200);

      if (messagesResponse.body.length > 0) {
        messageId = messagesResponse.body[0].id;
      }
    });

    it('deve retornar mensagem específica por ID', () => {
      if (!messageId) {
        return;
      }

      return request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages/${messageId}`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe(messageId);
        });
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      if (!messageId) {
        return;
      }

      return request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages/${messageId}`)
        .expect(401);
    });

    it('deve retornar erro 404 para mensagem inexistente', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages/99999`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(404);
    });
  });

  describe('DELETE /api/v1/:username/messages/:id', () => {
    beforeEach(async () => {
      // Criar uma mensagem e obter ID
      await request(app.getHttpServer())
        .post(`/api/v1/portfolio/${adminUser.username}/messages`)
        .send({
          name: 'Delete Test',
          email: 'deletetest@example.com',
          message: 'Test message for delete',
        });

      const messagesResponse = await request(app.getHttpServer())
        .get(`/api/v1/${adminUser.username}/messages`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(200);

      if (messagesResponse.body.length > 0) {
        messageId = messagesResponse.body[0].id;
      }
    });

    it('deve deletar mensagem existente', () => {
      if (!messageId) {
        return;
      }

      return request(app.getHttpServer())
        .delete(`/api/v1/${adminUser.username}/messages/${messageId}`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(204);
    });

    it('deve retornar erro 401 sem token de autenticação', () => {
      if (!messageId) {
        return;
      }

      return request(app.getHttpServer())
        .delete(`/api/v1/${adminUser.username}/messages/${messageId}`)
        .expect(401);
    });

    it('deve retornar erro 404 para mensagem inexistente', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/${adminUser.username}/messages/99999`)
        .set(getAuthHeaders(adminUser.token!))
        .expect(404);
    });
  });
});


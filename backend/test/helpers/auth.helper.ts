import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export interface TestUser {
  username: string;
  email: string;
  password: string;
  token?: string;
  id?: number;
}

/**
 * Helper para criar um usuário de teste via API
 */
export async function createTestUser(
  app: INestApplication,
  userData: Partial<TestUser> = {},
): Promise<TestUser> {
  const defaultUser: TestUser = {
    username: `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    ...userData,
  };

  const response = await request(app.getHttpServer())
    .post('/api/v1/portfolio/register')
    .send({
      username: defaultUser.username,
      email: defaultUser.email,
      password: defaultUser.password,
      firstName: 'Test',
      fullName: 'Test User',
    })
    .expect(201);

  defaultUser.id = response.body.id;
  return defaultUser;
}

/**
 * Helper para fazer login e obter token JWT
 */
export async function loginUser(
  app: INestApplication,
  username: string,
  password: string,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/sign-in')
    .send({ username, password })
    .expect(200);

  return response.body.accessToken;
}

/**
 * Helper para criar um usuário e fazer login automaticamente
 */
export async function createAndLoginUser(
  app: INestApplication,
  userData: Partial<TestUser> = {},
): Promise<TestUser> {
  const user = await createTestUser(app, userData);
  user.token = await loginUser(app, user.username, user.password);
  return user;
}

/**
 * Helper para obter headers de autenticação
 */
export function getAuthHeaders(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`,
  };
}


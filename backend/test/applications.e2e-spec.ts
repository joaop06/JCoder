import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ApplicationsModule } from '../src/applications/applications.module';
import { UsersModule } from '../src/users/users.module';
import { Application } from '../src/applications/entities/application.entity';
import { User } from '../src/users/entities/user.entity';
import { ApplicationTypeEnum } from '../src/applications/enums/application-type.enum';
import { RoleEnum } from '../src/@common/enums/role.enum';
import { testConfig } from './test.config';

describe('Applications E2E Tests', () => {
    let app: INestApplication;
    let jwtService: JwtService;
    let authToken: string;
    let testUser: User;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    load: [() => testConfig],
                }),
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [Application, User],
                    synchronize: true,
                    logging: false,
                }),
                TypeOrmModule.forFeature([Application, User]),
                CacheModule.register({
                    ttl: 300,
                    max: 100,
                }),
                UsersModule,
                ApplicationsModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        jwtService = moduleFixture.get<JwtService>(JwtService);

        // Create test user and get auth token
        testUser = {
            id: 1,
            email: 'admin@test.com',
            password: 'hashedPassword',
            role: RoleEnum.Admin,
            applications: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        };

        authToken = jwtService.sign({
            sub: testUser.id,
            email: testUser.email,
            role: testUser.role
        });
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        // Clean database before each test
        const connection = app.get('DataSource');
        await connection.synchronize(true);
    });

    describe('GET /applications', () => {
        it('should return empty array when no applications exist', async () => {
            return request(app.getHttpServer())
                .get('/applications')
                .expect(200)
                .expect([]);
        });

        it('should return applications when they exist', async () => {
            // Create test application first
            const createDto = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201);

            return request(app.getHttpServer())
                .get('/applications')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveLength(1);
                    expect(res.body[0].name).toBe('Test Application');
                });
        });

        it('should support query parameters', async () => {
            // Create test applications
            const apps = [
                {
                    name: 'API Application',
                    userId: 1,
                    description: 'API Description',
                    applicationType: ApplicationTypeEnum.API,
                    applicationComponentApi: {
                        domain: 'api.example.com',
                        apiUrl: 'https://api.example.com/v1',
                    },
                },
                {
                    name: 'Mobile Application',
                    userId: 1,
                    description: 'Mobile Description',
                    applicationType: ApplicationTypeEnum.MOBILE,
                    applicationComponentMobile: {
                        platform: 'ANDROID',
                        packageName: 'com.example.app',
                        version: '1.0.0',
                    },
                },
            ];

            for (const app of apps) {
                await request(app.getHttpServer())
                    .post('/applications')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(app)
                    .expect(201);
            }

            return request(app.getHttpServer())
                .get('/applications')
                .query({ where: JSON.stringify({ applicationType: ApplicationTypeEnum.API }) })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveLength(1);
                    expect(res.body[0].applicationType).toBe(ApplicationTypeEnum.API);
                });
        });
    });

    describe('GET /applications/paginated', () => {
        it('should return paginated applications', async () => {
            // Create multiple test applications
            for (let i = 1; i <= 15; i++) {
                const createDto = {
                    name: `Application ${i}`,
                    userId: 1,
                    description: `Description ${i}`,
                    applicationType: ApplicationTypeEnum.API,
                    applicationComponentApi: {
                        domain: `api${i}.example.com`,
                        apiUrl: `https://api${i}.example.com/v1`,
                    },
                };

                await request(app.getHttpServer())
                    .post('/applications')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(createDto)
                    .expect(201);
            }

            return request(app.getHttpServer())
                .get('/applications/paginated')
                .query({ page: 1, limit: 10 })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data).toHaveLength(10);
                    expect(res.body.meta.page).toBe(1);
                    expect(res.body.meta.limit).toBe(10);
                    expect(res.body.meta.total).toBe(15);
                    expect(res.body.meta.totalPages).toBe(2);
                    expect(res.body.meta.hasNextPage).toBe(true);
                    expect(res.body.meta.hasPreviousPage).toBe(false);
                });
        });

        it('should use default pagination parameters', async () => {
            return request(app.getHttpServer())
                .get('/applications/paginated')
                .expect(200)
                .expect((res) => {
                    expect(res.body.meta.page).toBe(1);
                    expect(res.body.meta.limit).toBe(10);
                });
        });

        it('should support custom sort parameters', async () => {
            // Create test applications
            const apps = [
                { name: 'Z Application', userId: 1, description: 'Z Description', applicationType: ApplicationTypeEnum.API },
                { name: 'A Application', userId: 1, description: 'A Description', applicationType: ApplicationTypeEnum.API },
            ];

            for (const app of apps) {
                await request(app.getHttpServer())
                    .post('/applications')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        ...app,
                        applicationComponentApi: {
                            domain: 'api.example.com',
                            apiUrl: 'https://api.example.com/v1',
                        },
                    })
                    .expect(201);
            }

            return request(app.getHttpServer())
                .get('/applications/paginated')
                .query({ sortBy: 'name', sortOrder: 'ASC' })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data[0].name).toBe('A Application');
                    expect(res.body.data[1].name).toBe('Z Application');
                });
        });
    });

    describe('GET /applications/:id', () => {
        it('should return application by id', async () => {
            // Create test application
            const createDto = {
                name: 'Get By ID Test',
                userId: 1,
                description: 'Get By ID Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            const createResponse = await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201);

            const applicationId = createResponse.body.id;

            return request(app.getHttpServer())
                .get(`/applications/${applicationId}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(applicationId);
                    expect(res.body.name).toBe('Get By ID Test');
                });
        });

        it('should return 404 for non-existent application', async () => {
            return request(app.getHttpServer())
                .get('/applications/999')
                .expect(404);
        });

        it('should return 400 for invalid id format', async () => {
            return request(app.getHttpServer())
                .get('/applications/invalid-id')
                .expect(400);
        });
    });

    describe('POST /applications', () => {
        it('should create API application successfully', async () => {
            const createDto = {
                name: 'API Test Application',
                userId: 1,
                description: 'API Test Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: 'https://github.com/test/api-app',
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                    documentationUrl: 'https://api.example.com/docs',
                    healthCheckEndpoint: 'https://api.example.com/health',
                },
            };

            return request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body.name).toBe(createDto.name);
                    expect(res.body.description).toBe(createDto.description);
                    expect(res.body.applicationType).toBe(createDto.applicationType);
                    expect(res.body.githubUrl).toBe(createDto.githubUrl);
                    expect(res.body.userId).toBe(createDto.userId);
                    expect(res.body.isActive).toBe(true);
                    expect(res.body.id).toBeDefined();
                    expect(res.body.createdAt).toBeDefined();
                    expect(res.body.updatedAt).toBeDefined();
                });
        });

        it('should create MOBILE application successfully', async () => {
            const createDto = {
                name: 'Mobile Test Application',
                userId: 1,
                description: 'Mobile Test Description',
                applicationType: ApplicationTypeEnum.MOBILE,
                applicationComponentMobile: {
                    platform: 'ANDROID',
                    packageName: 'com.example.mobile',
                    version: '1.0.0',
                },
            };

            return request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body.name).toBe(createDto.name);
                    expect(res.body.applicationType).toBe(createDto.applicationType);
                });
        });

        it('should create LIBRARY application successfully', async () => {
            const createDto = {
                name: 'Library Test Application',
                userId: 1,
                description: 'Library Test Description',
                applicationType: ApplicationTypeEnum.LIBRARY,
                applicationComponentLibrary: {
                    packageName: '@example/library',
                    version: '1.0.0',
                    repositoryUrl: 'https://github.com/example/library',
                },
            };

            return request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body.name).toBe(createDto.name);
                    expect(res.body.applicationType).toBe(createDto.applicationType);
                });
        });

        it('should create FRONTEND application successfully', async () => {
            const createDto = {
                name: 'Frontend Test Application',
                userId: 1,
                description: 'Frontend Test Description',
                applicationType: ApplicationTypeEnum.FRONTEND,
                applicationComponentFrontend: {
                    domain: 'app.example.com',
                    url: 'https://app.example.com',
                },
            };

            return request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body.name).toBe(createDto.name);
                    expect(res.body.applicationType).toBe(createDto.applicationType);
                });
        });

        it('should create FULLSTACK application successfully', async () => {
            const createDto = {
                name: 'Fullstack Test Application',
                userId: 1,
                description: 'Fullstack Test Description',
                applicationType: ApplicationTypeEnum.FULLSTACK,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
                applicationComponentFrontend: {
                    domain: 'app.example.com',
                    url: 'https://app.example.com',
                },
            };

            return request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body.name).toBe(createDto.name);
                    expect(res.body.applicationType).toBe(createDto.applicationType);
                });
        });

        it('should return 400 for missing required fields', async () => {
            const invalidDto = {
                // Missing name
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
            };

            return request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidDto)
                .expect(400);
        });

        it('should return 400 for invalid application type', async () => {
            const invalidDto = {
                name: 'Invalid Type App',
                userId: 1,
                description: 'Test Description',
                applicationType: 'INVALID_TYPE',
            };

            return request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidDto)
                .expect(400);
        });

        it('should return 400 for API application without component', async () => {
            const invalidDto = {
                name: 'API Without Component',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                // Missing applicationComponentApi
            };

            return request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidDto)
                .expect(400);
        });

        it('should return 400 for duplicate application name', async () => {
            const createDto = {
                name: 'Duplicate Name App',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            // Create first application
            await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201);

            // Try to create second application with same name
            return request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should return 401 without authorization', async () => {
            const createDto = {
                name: 'Unauthorized App',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            return request(app.getHttpServer())
                .post('/applications')
                .send(createDto)
                .expect(401);
        });

        it('should return 403 for non-admin user', async () => {
            // Create non-admin token
            const nonAdminToken = jwtService.sign({
                sub: 2,
                email: 'user@test.com',
                role: RoleEnum.User
            });

            const createDto = {
                name: 'Non-Admin App',
                userId: 2,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            return request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${nonAdminToken}`)
                .send(createDto)
                .expect(403);
        });
    });

    describe('PUT /applications/:id', () => {
        let applicationId: number;

        beforeEach(async () => {
            // Create test application for update tests
            const createDto = {
                name: 'Update Test Application',
                userId: 1,
                description: 'Update Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            const response = await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201);

            applicationId = response.body.id;
        });

        it('should update application successfully', async () => {
            const updateDto = {
                name: 'Updated Application Name',
                description: 'Updated Description',
                githubUrl: 'https://github.com/test/updated',
            };

            return request(app.getHttpServer())
                .put(`/applications/${applicationId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body.name).toBe(updateDto.name);
                    expect(res.body.description).toBe(updateDto.description);
                    expect(res.body.githubUrl).toBe(updateDto.githubUrl);
                    expect(res.body.id).toBe(applicationId);
                });
        });

        it('should update application type and components', async () => {
            const updateDto = {
                applicationType: ApplicationTypeEnum.MOBILE,
                applicationComponentMobile: {
                    platform: 'ANDROID',
                    packageName: 'com.example.updated',
                    version: '2.0.0',
                },
            };

            return request(app.getHttpServer())
                .put(`/applications/${applicationId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body.applicationType).toBe(updateDto.applicationType);
                });
        });

        it('should return 404 for non-existent application', async () => {
            const updateDto = {
                name: 'Updated Name',
            };

            return request(app.getHttpServer())
                .put('/applications/999')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateDto)
                .expect(404);
        });

        it('should return 400 for duplicate name', async () => {
            // Create another application
            const createDto = {
                name: 'Another Application',
                userId: 1,
                description: 'Another Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'another.example.com',
                    apiUrl: 'https://another.example.com/v1',
                },
            };

            await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201);

            // Try to update first application with same name as second
            const updateDto = {
                name: 'Another Application',
            };

            return request(app.getHttpServer())
                .put(`/applications/${applicationId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateDto)
                .expect(400);
        });

        it('should return 401 without authorization', async () => {
            const updateDto = {
                name: 'Unauthorized Update',
            };

            return request(app.getHttpServer())
                .put(`/applications/${applicationId}`)
                .send(updateDto)
                .expect(401);
        });

        it('should return 403 for non-admin user', async () => {
            const nonAdminToken = jwtService.sign({
                sub: 2,
                email: 'user@test.com',
                role: RoleEnum.User
            });

            const updateDto = {
                name: 'Non-Admin Update',
            };

            return request(app.getHttpServer())
                .put(`/applications/${applicationId}`)
                .set('Authorization', `Bearer ${nonAdminToken}`)
                .send(updateDto)
                .expect(403);
        });
    });

    describe('DELETE /applications/:id', () => {
        let applicationId: number;

        beforeEach(async () => {
            // Create test application for delete tests
            const createDto = {
                name: 'Delete Test Application',
                userId: 1,
                description: 'Delete Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            const response = await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201);

            applicationId = response.body.id;
        });

        it('should delete application successfully', async () => {
            return request(app.getHttpServer())
                .delete(`/applications/${applicationId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(204);
        });

        it('should return 404 when trying to get deleted application', async () => {
            // Delete application
            await request(app.getHttpServer())
                .delete(`/applications/${applicationId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(204);

            // Try to get deleted application
            return request(app.getHttpServer())
                .get(`/applications/${applicationId}`)
                .expect(404);
        });

        it('should return 404 for non-existent application', async () => {
            return request(app.getHttpServer())
                .delete('/applications/999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });

        it('should return 401 without authorization', async () => {
            return request(app.getHttpServer())
                .delete(`/applications/${applicationId}`)
                .expect(401);
        });

        it('should return 403 for non-admin user', async () => {
            const nonAdminToken = jwtService.sign({
                sub: 2,
                email: 'user@test.com',
                role: RoleEnum.User
            });

            return request(app.getHttpServer())
                .delete(`/applications/${applicationId}`)
                .set('Authorization', `Bearer ${nonAdminToken}`)
                .expect(403);
        });
    });

    describe('POST /applications/:id/images', () => {
        let applicationId: number;

        beforeEach(async () => {
            // Create test application for image upload tests
            const createDto = {
                name: 'Image Upload Test Application',
                userId: 1,
                description: 'Image Upload Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            const response = await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201);

            applicationId = response.body.id;
        });

        it('should upload images successfully', async () => {
            // Create mock image files
            const imageBuffer = Buffer.from('fake-image-data');

            return request(app.getHttpServer())
                .post(`/applications/${applicationId}/images`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('images', imageBuffer, 'test-image.jpg')
                .expect(200)
                .expect((res) => {
                    expect(res.body.images).toBeDefined();
                    expect(Array.isArray(res.body.images)).toBe(true);
                });
        });

        it('should upload multiple images', async () => {
            const imageBuffer1 = Buffer.from('fake-image-data-1');
            const imageBuffer2 = Buffer.from('fake-image-data-2');

            return request(app.getHttpServer())
                .post(`/applications/${applicationId}/images`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('images', imageBuffer1, 'test-image-1.jpg')
                .attach('images', imageBuffer2, 'test-image-2.png')
                .expect(200)
                .expect((res) => {
                    expect(res.body.images).toHaveLength(2);
                });
        });

        it('should return 400 for invalid file type', async () => {
            const textBuffer = Buffer.from('not-an-image');

            return request(app.getHttpServer())
                .post(`/applications/${applicationId}/images`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('images', textBuffer, 'test.txt')
                .expect(400);
        });

        it('should return 404 for non-existent application', async () => {
            const imageBuffer = Buffer.from('fake-image-data');

            return request(app.getHttpServer())
                .post('/applications/999/images')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('images', imageBuffer, 'test-image.jpg')
                .expect(404);
        });

        it('should return 401 without authorization', async () => {
            const imageBuffer = Buffer.from('fake-image-data');

            return request(app.getHttpServer())
                .post(`/applications/${applicationId}/images`)
                .attach('images', imageBuffer, 'test-image.jpg')
                .expect(401);
        });
    });

    describe('GET /applications/:id/images/:filename', () => {
        let applicationId: number;
        let imageFilename: string;

        beforeEach(async () => {
            // Create test application and upload image
            const createDto = {
                name: 'Image Get Test Application',
                userId: 1,
                description: 'Image Get Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            const createResponse = await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201);

            applicationId = createResponse.body.id;

            // Upload image
            const imageBuffer = Buffer.from('fake-image-data');
            const uploadResponse = await request(app.getHttpServer())
                .post(`/applications/${applicationId}/images`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('images', imageBuffer, 'test-image.jpg')
                .expect(200);

            imageFilename = uploadResponse.body.images[0];
        });

        it('should return image file', async () => {
            return request(app.getHttpServer())
                .get(`/applications/${applicationId}/images/${imageFilename}`)
                .expect(200)
                .expect('Content-Type', /image\/(jpeg|jpg)/);
        });

        it('should return 404 for non-existent image', async () => {
            return request(app.getHttpServer())
                .get(`/applications/${applicationId}/images/non-existent.jpg`)
                .expect(404);
        });

        it('should return 404 for non-existent application', async () => {
            return request(app.getHttpServer())
                .get('/applications/999/images/test.jpg')
                .expect(404);
        });
    });

    describe('DELETE /applications/:id/images/:filename', () => {
        let applicationId: number;
        let imageFilename: string;

        beforeEach(async () => {
            // Create test application and upload image
            const createDto = {
                name: 'Image Delete Test Application',
                userId: 1,
                description: 'Image Delete Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            const createResponse = await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createDto)
                .expect(201);

            applicationId = createResponse.body.id;

            // Upload image
            const imageBuffer = Buffer.from('fake-image-data');
            const uploadResponse = await request(app.getHttpServer())
                .post(`/applications/${applicationId}/images`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('images', imageBuffer, 'test-image.jpg')
                .expect(200);

            imageFilename = uploadResponse.body.images[0];
        });

        it('should delete image successfully', async () => {
            return request(app.getHttpServer())
                .delete(`/applications/${applicationId}/images/${imageFilename}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(204);
        });

        it('should return 404 for non-existent image', async () => {
            return request(app.getHttpServer())
                .delete(`/applications/${applicationId}/images/non-existent.jpg`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });

        it('should return 404 for non-existent application', async () => {
            return request(app.getHttpServer())
                .delete('/applications/999/images/test.jpg')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });

        it('should return 401 without authorization', async () => {
            return request(app.getHttpServer())
                .delete(`/applications/${applicationId}/images/${imageFilename}`)
                .expect(401);
        });
    });

    describe('Error Handling', () => {
        it('should handle malformed JSON', async () => {
            return request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${authToken}`)
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}')
                .expect(400);
        });

        it('should handle invalid JWT token', async () => {
            return request(app.getHttpServer())
                .get('/applications')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });

        it('should handle missing JWT token', async () => {
            return request(app.getHttpServer())
                .post('/applications')
                .send({})
                .expect(401);
        });

        it('should handle expired JWT token', async () => {
            const expiredToken = jwtService.sign(
                { sub: 1, email: 'test@test.com', role: RoleEnum.Admin },
                { expiresIn: '-1h' }
            );

            return request(app.getHttpServer())
                .get('/applications')
                .set('Authorization', `Bearer ${expiredToken}`)
                .expect(401);
        });
    });

    describe('Performance Tests', () => {
        it('should handle multiple concurrent requests', async () => {
            const requests = Array(10).fill(null).map((_, index) => {
                const createDto = {
                    name: `Concurrent App ${index}`,
                    userId: 1,
                    description: `Concurrent Description ${index}`,
                    applicationType: ApplicationTypeEnum.API,
                    applicationComponentApi: {
                        domain: `api${index}.example.com`,
                        apiUrl: `https://api${index}.example.com/v1`,
                    },
                };

                return request(app.getHttpServer())
                    .post('/applications')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(createDto);
            });

            const responses = await Promise.all(requests);

            responses.forEach(response => {
                expect(response.status).toBe(201);
                expect(response.body.id).toBeDefined();
            });
        });

        it('should handle large pagination requests', async () => {
            // Create many applications
            const createPromises = Array(50).fill(null).map((_, index) => {
                const createDto = {
                    name: `Large Pagination App ${index}`,
                    userId: 1,
                    description: `Large Pagination Description ${index}`,
                    applicationType: ApplicationTypeEnum.API,
                    applicationComponentApi: {
                        domain: `api${index}.example.com`,
                        apiUrl: `https://api${index}.example.com/v1`,
                    },
                };

                return request(app.getHttpServer())
                    .post('/applications')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(createDto);
            });

            await Promise.all(createPromises);

            // Test pagination
            return request(app.getHttpServer())
                .get('/applications/paginated')
                .query({ page: 1, limit: 25 })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data).toHaveLength(25);
                    expect(res.body.meta.total).toBe(50);
                    expect(res.body.meta.totalPages).toBe(2);
                });
        });
    });
});

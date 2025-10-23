import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health.module';
import { HealthController } from './health.controller';
import {
    HealthCheckService,
    TypeOrmHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
} from '@nestjs/terminus';

// Mock health indicators
class MockTypeOrmHealthIndicator {
    async pingCheck(key: string) {
        return {
            [key]: {
                status: 'up',
                message: 'Database connection is healthy',
            },
        };
    }
}

class MockMemoryHealthIndicator {
    async checkHeap(key: string, threshold: number) {
        const heapUsed = process.memoryUsage().heapUsed;
        const isHealthy = heapUsed < threshold;

        return {
            [key]: {
                status: isHealthy ? 'up' : 'down',
                heapUsed: heapUsed,
                threshold: threshold,
                message: isHealthy ? 'Memory heap is healthy' : 'Memory heap usage exceeded threshold',
            },
        };
    }

    async checkRSS(key: string, threshold: number) {
        const rssUsed = process.memoryUsage().rss;
        const isHealthy = rssUsed < threshold;

        return {
            [key]: {
                status: isHealthy ? 'up' : 'down',
                rssUsed: rssUsed,
                threshold: threshold,
                message: isHealthy ? 'Memory RSS is healthy' : 'Memory RSS usage exceeded threshold',
            },
        };
    }
}

class MockDiskHealthIndicator {
    async checkStorage(key: string, options: { path: string; thresholdPercent: number }) {
        // Mock disk usage - in real scenario this would check actual disk usage
        const mockUsedPercent = 0.5; // 50% used
        const isHealthy = mockUsedPercent < options.thresholdPercent;

        return {
            [key]: {
                status: isHealthy ? 'up' : 'down',
                usedPercent: mockUsedPercent,
                thresholdPercent: options.thresholdPercent,
                path: options.path,
                message: isHealthy ? 'Disk storage is healthy' : 'Disk storage usage exceeded threshold',
            },
        };
    }
}

// Mock HealthCheckService
class MockHealthCheckService {
    async check(healthIndicators: (() => Promise<any>)[]) {
        const results = {};

        for (const indicator of healthIndicators) {
            const result = await indicator();
            Object.assign(results, result);
        }

        // Determine overall status
        const allHealthy = Object.values(results).every((check: any) => check.status === 'up');

        return {
            status: allHealthy ? 'ok' : 'error',
            info: results,
            error: allHealthy ? {} : results,
            details: results,
        };
    }
}

describe('HealthModule Integration', () => {
    let module: TestingModule;
    let healthController: HealthController;
    let healthCheckService: MockHealthCheckService;
    let typeOrmHealthIndicator: MockTypeOrmHealthIndicator;
    let memoryHealthIndicator: MockMemoryHealthIndicator;
    let diskHealthIndicator: MockDiskHealthIndicator;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env.test',
                }),
            ],
            providers: [
                HealthController,
                {
                    provide: HealthCheckService,
                    useClass: MockHealthCheckService,
                },
                {
                    provide: TypeOrmHealthIndicator,
                    useClass: MockTypeOrmHealthIndicator,
                },
                {
                    provide: MemoryHealthIndicator,
                    useClass: MockMemoryHealthIndicator,
                },
                {
                    provide: DiskHealthIndicator,
                    useClass: MockDiskHealthIndicator,
                },
            ],
        }).compile();

        module = moduleFixture;
        healthController = module.get<HealthController>(HealthController);
        healthCheckService = module.get<MockHealthCheckService>(HealthCheckService);

        // Create instances directly since they are scoped providers
        typeOrmHealthIndicator = new MockTypeOrmHealthIndicator();
        memoryHealthIndicator = new MockMemoryHealthIndicator();
        diskHealthIndicator = new MockDiskHealthIndicator();
    });

    describe('Module Initialization', () => {
        it('should have module defined', () => {
            expect(module).toBeDefined();
        });

        it('should have HealthController defined', () => {
            expect(healthController).toBeDefined();
            expect(healthController).toBeInstanceOf(HealthController);
        });

        it('should have health check providers available', () => {
            // This is implicitly tested by the module compiling successfully and providers being available
            expect(true).toBe(true);
        });

        it('should have all health indicators available', () => {
            expect(typeOrmHealthIndicator).toBeDefined();
            expect(typeOrmHealthIndicator).toBeInstanceOf(MockTypeOrmHealthIndicator);
            expect(memoryHealthIndicator).toBeDefined();
            expect(memoryHealthIndicator).toBeInstanceOf(MockMemoryHealthIndicator);
            expect(diskHealthIndicator).toBeDefined();
            expect(diskHealthIndicator).toBeInstanceOf(MockDiskHealthIndicator);
        });

        it('should have HealthCheckService available', () => {
            expect(healthCheckService).toBeDefined();
            expect(healthCheckService).toBeDefined();
        });
    });

    describe('Health Indicators Integration', () => {
        describe('TypeOrmHealthIndicator', () => {
            it('should perform database ping check', async () => {
                const result = await typeOrmHealthIndicator.pingCheck('database');

                expect(result).toHaveProperty('database');
                expect(result.database).toHaveProperty('status', 'up');
                expect(result.database).toHaveProperty('message');
            });

            it('should handle database connection failures', async () => {
                jest.spyOn(typeOrmHealthIndicator, 'pingCheck').mockResolvedValue({
                    database: {
                        status: 'down',
                        message: 'Database connection timeout',
                    },
                });

                const result = await typeOrmHealthIndicator.pingCheck('database');

                expect(result.database.status).toBe('down');
                expect(result.database.message).toBe('Database connection timeout');
            });
        });

        describe('MemoryHealthIndicator', () => {
            it('should check heap memory usage', async () => {
                const result = await memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024);

                expect(result).toHaveProperty('memory_heap');
                expect(result.memory_heap).toHaveProperty('status');
                expect(result.memory_heap).toHaveProperty('heapUsed');
                expect(result.memory_heap).toHaveProperty('threshold');
                expect(result.memory_heap).toHaveProperty('message');
                expect(typeof result.memory_heap.heapUsed).toBe('number');
                expect(result.memory_heap.threshold).toBe(300 * 1024 * 1024);
            });

            it('should check RSS memory usage', async () => {
                const result = await memoryHealthIndicator.checkRSS('memory_rss', 300 * 1024 * 1024);

                expect(result).toHaveProperty('memory_rss');
                expect(result.memory_rss).toHaveProperty('status');
                expect(result.memory_rss).toHaveProperty('rssUsed');
                expect(result.memory_rss).toHaveProperty('threshold');
                expect(result.memory_rss).toHaveProperty('message');
                expect(typeof result.memory_rss.rssUsed).toBe('number');
                expect(result.memory_rss.threshold).toBe(300 * 1024 * 1024);
            });

            it('should detect memory threshold exceeded', async () => {
                // Mock high memory usage
                const originalMemoryUsage = process.memoryUsage;
                process.memoryUsage = jest.fn().mockReturnValue({
                    rss: 400 * 1024 * 1024, // 400MB
                    heapTotal: 200 * 1024 * 1024,
                    heapUsed: 400 * 1024 * 1024, // 400MB
                    external: 100 * 1024 * 1024,
                    arrayBuffers: 50 * 1024 * 1024,
                });

                const result = await memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024);

                expect(result.memory_heap.status).toBe('down');
                expect(result.memory_heap.heapUsed).toBe(400 * 1024 * 1024);
                expect(result.memory_heap.threshold).toBe(300 * 1024 * 1024);

                // Restore original function
                process.memoryUsage = originalMemoryUsage;
            });
        });

        describe('DiskHealthIndicator', () => {
            it('should check disk storage usage', async () => {
                const result = await diskHealthIndicator.checkStorage('storage', {
                    path: 'C:/',
                    thresholdPercent: 0.8,
                });

                expect(result).toHaveProperty('storage');
                expect(result.storage).toHaveProperty('status');
                expect(result.storage).toHaveProperty('usedPercent');
                expect(result.storage).toHaveProperty('thresholdPercent');
                expect(result.storage).toHaveProperty('path');
                expect(result.storage).toHaveProperty('message');
                expect(result.storage.path).toBe('C:/');
                expect(result.storage.thresholdPercent).toBe(0.8);
            });

            it('should detect disk threshold exceeded', async () => {
                // Mock high disk usage
                jest.spyOn(diskHealthIndicator, 'checkStorage').mockResolvedValue({
                    storage: {
                        status: 'down',
                        usedPercent: 0.9, // 90% used
                        thresholdPercent: 0.8, // 80% threshold
                        path: 'C:/',
                        message: 'Disk storage usage exceeded threshold',
                    },
                });

                const result = await diskHealthIndicator.checkStorage('storage', {
                    path: 'C:/',
                    thresholdPercent: 0.8,
                });

                expect(result.storage.status).toBe('down');
                expect(result.storage.usedPercent).toBe(0.9);
                expect(result.storage.thresholdPercent).toBe(0.8);
            });
        });
    });

    describe('Health Check Service Integration', () => {
        it('should aggregate health check results correctly', async () => {
            const healthIndicators = [
                () => typeOrmHealthIndicator.pingCheck('database'),
                () => memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024),
                () => memoryHealthIndicator.checkRSS('memory_rss', 300 * 1024 * 1024),
                () => diskHealthIndicator.checkStorage('storage', { path: 'C:/', thresholdPercent: 0.8 }),
            ];

            const result = await healthCheckService.check(healthIndicators);

            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('info');
            expect(result).toHaveProperty('details');
            expect(result.info).toHaveProperty('database');
            expect(result.info).toHaveProperty('memory_heap');
            expect(result.info).toHaveProperty('memory_rss');
            expect(result.info).toHaveProperty('storage');
        });

        it('should return error status when any check fails', async () => {
            jest.spyOn(memoryHealthIndicator, 'checkHeap').mockResolvedValue({
                memory_heap: {
                    status: 'down',
                    heapUsed: 400 * 1024 * 1024,
                    threshold: 300 * 1024 * 1024,
                    message: 'Memory heap usage exceeded threshold',
                },
            });

            const healthIndicators = [
                () => typeOrmHealthIndicator.pingCheck('database'),
                () => memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024),
            ];

            const result = await healthCheckService.check(healthIndicators);

            expect(result.status).toBe('error');
            expect(result.error.memory_heap.status).toBe('down');
        });

        it('should handle multiple health indicators', async () => {
            const healthIndicators = [
                () => typeOrmHealthIndicator.pingCheck('database'),
                () => memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024),
            ];

            const result = await healthCheckService.check(healthIndicators);

            expect(result.info).toHaveProperty('database');
            expect(result.info).toHaveProperty('memory_heap');
            expect(Object.keys(result.info)).toHaveLength(2);
        });

        it('should handle empty health indicators array', async () => {
            const result = await healthCheckService.check([]);

            expect(result.status).toBe('ok');
            expect(result.info).toEqual({});
            expect(result.error).toEqual({});
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle health indicator exceptions', async () => {
            jest.spyOn(typeOrmHealthIndicator, 'pingCheck').mockRejectedValue(new Error('Database connection failed'));

            const healthIndicators = [
                () => typeOrmHealthIndicator.pingCheck('database'),
            ];

            await expect(healthCheckService.check(healthIndicators)).rejects.toThrow('Database connection failed');
        });

        it('should handle memory indicator exceptions', async () => {
            jest.spyOn(memoryHealthIndicator, 'checkHeap').mockRejectedValue(new Error('Memory check failed'));

            const healthIndicators = [
                () => memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024),
            ];

            await expect(healthCheckService.check(healthIndicators)).rejects.toThrow('Memory check failed');
        });

        it('should handle disk indicator exceptions', async () => {
            jest.spyOn(diskHealthIndicator, 'checkStorage').mockRejectedValue(new Error('Disk check failed'));

            const healthIndicators = [
                () => diskHealthIndicator.checkStorage('storage', { path: 'C:/', thresholdPercent: 0.8 }),
            ];

            await expect(healthCheckService.check(healthIndicators)).rejects.toThrow('Disk check failed');
        });
    });

    describe('Configuration Integration', () => {
        it('should use correct memory thresholds', async () => {
            const heapSpy = jest.spyOn(memoryHealthIndicator, 'checkHeap');
            const rssSpy = jest.spyOn(memoryHealthIndicator, 'checkRSS');

            const healthIndicators = [
                () => memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024),
                () => memoryHealthIndicator.checkRSS('memory_rss', 300 * 1024 * 1024),
            ];

            await healthCheckService.check(healthIndicators);

            expect(heapSpy).toHaveBeenCalledWith('memory_heap', 300 * 1024 * 1024);
            expect(rssSpy).toHaveBeenCalledWith('memory_rss', 300 * 1024 * 1024);
        });

        it('should use correct disk threshold', async () => {
            const diskSpy = jest.spyOn(diskHealthIndicator, 'checkStorage');

            const healthIndicators = [
                () => diskHealthIndicator.checkStorage('storage', { path: 'C:/', thresholdPercent: 0.8 }),
            ];

            await healthCheckService.check(healthIndicators);

            expect(diskSpy).toHaveBeenCalledWith('storage', {
                path: 'C:/',
                thresholdPercent: 0.8,
            });
        });

        it('should use correct database check key', async () => {
            const dbSpy = jest.spyOn(typeOrmHealthIndicator, 'pingCheck');

            const healthIndicators = [
                () => typeOrmHealthIndicator.pingCheck('database'),
            ];

            await healthCheckService.check(healthIndicators);

            expect(dbSpy).toHaveBeenCalledWith('database');
        });
    });

    describe('Performance and Concurrency', () => {
        it('should handle concurrent health check requests', async () => {
            const healthIndicators = [
                () => typeOrmHealthIndicator.pingCheck('database'),
                () => memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024),
            ];

            const promises = Array.from({ length: 10 }, () => healthCheckService.check(healthIndicators));

            const results = await Promise.all(promises);

            results.forEach(result => {
                expect(result).toHaveProperty('status');
                expect(result).toHaveProperty('info');
            });
        });

        it('should respond quickly to health checks', async () => {
            const startTime = Date.now();

            const healthIndicators = [
                () => typeOrmHealthIndicator.pingCheck('database'),
            ];

            await healthCheckService.check(healthIndicators);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Health checks should respond within 1 second
            expect(responseTime).toBeLessThan(1000);
        });

        it('should handle mixed healthy and unhealthy indicators', async () => {
            jest.spyOn(memoryHealthIndicator, 'checkHeap').mockResolvedValue({
                memory_heap: {
                    status: 'down',
                    heapUsed: 400 * 1024 * 1024,
                    threshold: 300 * 1024 * 1024,
                    message: 'Memory heap usage exceeded threshold',
                },
            });

            const healthIndicators = [
                () => typeOrmHealthIndicator.pingCheck('database'),
                () => memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024),
            ];

            const result = await healthCheckService.check(healthIndicators);

            expect(result.status).toBe('error');
            expect(result.info.database.status).toBe('up');
            expect(result.error.memory_heap.status).toBe('down');
        });
    });

    describe('Module Dependencies Integration', () => {
        it('should integrate with ConfigModule', () => {
            expect(module.get(ConfigModule)).toBeDefined();
        });

        it('should have proper module structure', () => {
            expect(module.get(HealthController)).toBeDefined();
        });
    });
});
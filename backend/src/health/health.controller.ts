import {
    HealthCheck,
    HealthCheckService,
    DiskHealthIndicator,
    MemoryHealthIndicator,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly disk: DiskHealthIndicator,
        private readonly db: TypeOrmHealthIndicator,
        private readonly health: HealthCheckService,
        private readonly memory: MemoryHealthIndicator,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get application health status' })
    @ApiResponse({ status: 200, description: 'Health check successful' })
    @ApiResponse({ status: 503, description: 'Health check failed' })
    @HealthCheck()
    check() {
        return this.health.check([
            // Database health check
            () => this.db.pingCheck('database'),

            // Memory health check (heap used should not exceed 300MB)
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

            // Memory health check (RSS should not exceed 300MB)
            () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

            // Disk health check (used space should not exceed 80%)
            () => this.disk.checkStorage('storage', {
                path: '/',
                thresholdPercent: 0.8
            }),
        ]);
    }

    @Get('ready')
    @ApiOperation({ summary: 'Get application readiness status' })
    @ApiResponse({ status: 200, description: 'Application is ready' })
    @ApiResponse({ status: 503, description: 'Application is not ready' })
    @HealthCheck()
    readiness() {
        return this.health.check([
            () => this.db.pingCheck('database'),
        ]);
    }

    @Get('live')
    @ApiOperation({ summary: 'Get application liveness status' })
    @ApiResponse({ status: 200, description: 'Application is alive' })
    @ApiResponse({ status: 503, description: 'Application is not alive' })
    @HealthCheck()
    liveness() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
        ]);
    }
}

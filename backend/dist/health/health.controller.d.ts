import { HealthCheckService, DiskHealthIndicator, MemoryHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private readonly disk;
    private readonly db;
    private readonly health;
    private readonly memory;
    constructor(disk: DiskHealthIndicator, db: TypeOrmHealthIndicator, health: HealthCheckService, memory: MemoryHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    readiness(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    liveness(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}

import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { HealthResponse, ReadinessResponse } from '@ehp/shared-types';
import { PrismaService } from '../database/prisma.service.js';

export const SERVICE_NAME = 'ehp-api';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Liveness: the process is up. Does not touch the database. */
  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  live(): HealthResponse {
    return { status: 'ok', service: SERVICE_NAME, timestamp: new Date().toISOString() };
  }

  /** Readiness: the process can serve traffic, i.e. PostgreSQL answers a trivial query. */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check (verifies database connectivity)' })
  async ready(): Promise<ReadinessResponse> {
    const timestamp = new Date().toISOString();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        service: SERVICE_NAME,
        timestamp,
        checks: { database: 'down' },
      } satisfies ReadinessResponse);
    }
    return { status: 'ok', service: SERVICE_NAME, timestamp, checks: { database: 'up' } };
  }
}

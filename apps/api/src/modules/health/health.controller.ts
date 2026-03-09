import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

import { Public } from "../../common/decorators/public.decorator";
import { PrismaService } from "../../config/database.module";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Health check endpoint" })
  check() {
    return this.health.check([
      () => this.db.pingCheck("database", this.prisma),
    ]);
  }
}

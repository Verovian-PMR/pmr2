import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UserRole } from "@vivipractice/types";

import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Audit")
@ApiBearerAuth()
@Controller("audit")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PHARMACY_ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: "List audit logs (admin only)" })
  findAll(
    @Query("userId") userId?: string,
    @Query("page") page?: number,
    @Query("pageSize") pageSize?: number,
  ) {
    return this.auditService.findAll({ userId, page, pageSize });
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { Reflector } from "@nestjs/core";

import { PrismaService } from "../../config/database.module";
import { Prisma } from "@prisma/client";

export const AUDIT_KEY = "audit";

export interface AuditMetadata {
  action: "CREATE" | "UPDATE" | "DELETE" | "EXPORT";
  entity: string;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditMeta = this.reflector.get<AuditMetadata>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditMeta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(async (response) => {
        if (user?.id) {
          try {
            await this.prisma.auditLog.create({
              data: {
                userId: user.id,
                action: auditMeta.action,
                entity: auditMeta.entity,
                entityId: (response as any)?.id || request.params?.id || null,
                details: {
                  method: request.method,
                  path: request.url,
                  body: this.sanitizeBody(request.body),
                } as unknown as Prisma.InputJsonValue,
                ipAddress:
                  request.ip ||
                  request.headers["x-forwarded-for"] ||
                  "unknown",
              },
            });
          } catch (error) {
            // Audit log failure should not block the request
            console.error("Audit log failed:", error);
          }
        }
      }),
    );
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body) return {};
    const sanitized = { ...body };
    // Strip sensitive fields from audit logs
    const sensitiveFields = ["password", "passwordHash", "mfaSecret", "token"];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = "[REDACTED]";
      }
    }
    return sanitized;
  }
}

import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../config/database.module";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { userId?: string; page?: number; pageSize?: number }) {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 50;
    const where = filters?.userId ? { userId: filters.userId } : {};

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }
}

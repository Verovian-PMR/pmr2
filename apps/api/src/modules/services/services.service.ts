import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../config/database.module";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    description: string;
    duration: number;
    featuredImageUrl?: string;
  }) {
    const maxOrder = await this.prisma.service.aggregate({ _max: { order: true } });
    return this.prisma.service.create({
      data: { ...data, order: (maxOrder._max.order ?? -1) + 1 },
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.service.findMany({
      where: includeInactive ? {} : { status: "ACTIVE" },
      orderBy: { order: "asc" },
    });
  }

  async findById(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("Service not found");
    return service;
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    duration?: number;
    featuredImageUrl?: string;
    status?: "ACTIVE" | "INACTIVE";
    order?: number;
  }) {
    return this.prisma.service.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.service.delete({ where: { id } });
  }
}

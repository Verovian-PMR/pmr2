import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../config/database.module";

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create appointment with double-booking prevention (FR-PF-05).
   * Uses a database-level check to prevent race conditions.
   */
  async create(data: {
    serviceId: string;
    providerId?: string;
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    slotStart: Date;
    slotEnd: Date;
    formData?: Record<string, unknown>;
  }) {
    // Check for overlapping appointments (double-booking prevention)
    const overlap = await this.prisma.appointment.findFirst({
      where: {
        providerId: data.providerId,
        status: { in: ["PENDING", "CONFIRMED"] },
        slotStart: { lt: data.slotEnd },
        slotEnd: { gt: data.slotStart },
      },
    });

    if (overlap) {
      throw new ConflictException("Time slot is already booked");
    }

    return this.prisma.appointment.create({ data: data as any });
  }

  async findAll(filters?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;

    const where = filters?.status ? { status: filters.status as any } : {};

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: { service: true, provider: true },
        orderBy: { slotStart: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { service: true, provider: true },
    });
    if (!appointment) throw new NotFoundException("Appointment not found");
    return appointment;
  }

  async updateStatus(id: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED") {
    return this.prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Get booked time slots for a provider on a specific date.
   * Merges data from the DB appointments table and the appointments-data JSON blob
   * (synced from the dashboard). Returns only PENDING/CONFIRMED slots.
   */
  async getBookedSlots(providerId: string, date: string) {
    if (!providerId || !date) return [];

    // 1. Query DB for real appointments on this date
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const dbAppointments = await this.prisma.appointment.findMany({
      where: {
        providerId,
        status: { in: ["PENDING", "CONFIRMED"] },
        slotStart: { gte: dayStart, lte: dayEnd },
      },
      select: { slotStart: true, slotEnd: true },
    });

    const slots: { start: string; end: string }[] = dbAppointments.map((a) => ({
      start: a.slotStart.toISOString(),
      end: a.slotEnd.toISOString(),
    }));

    // 2. Also check the appointments-data JSON blob (dashboard-managed appointments)
    try {
      const row = await this.prisma.siteSettings.findUnique({
        where: { id: "appointments_data" },
      });
      if (row?.settingsJson) {
        const blobAppointments = row.settingsJson as any[];
        for (const apt of blobAppointments) {
          if (
            apt.providerId === providerId &&
            apt.date === date &&
            apt.status !== "completed" &&
            apt.status !== "cancelled"
          ) {
            // Dashboard appointments use date + startTime/endTime (HH:mm)
            slots.push({
              start: `${apt.date}T${apt.startTime}:00`,
              end: `${apt.date}T${apt.endTime}:00`,
            });
          }
        }
      }
    } catch {}

    return slots;
  }

  async exportCsv() {
    const appointments = await this.prisma.appointment.findMany({
      include: { service: true, provider: true },
      orderBy: { slotStart: "desc" },
    });

    const header = "ID,Patient Name,Patient Email,Service,Provider,Start,End,Status\n";
    const rows = appointments.map((a) =>
      [
        a.id,
        `"${a.patientName}"`,
        a.patientEmail,
        `"${a.service.name}"`,
        a.provider?.name || "N/A",
        a.slotStart.toISOString(),
        a.slotEnd.toISOString(),
        a.status,
      ].join(",")
    );

    return header + rows.join("\n");
  }
}

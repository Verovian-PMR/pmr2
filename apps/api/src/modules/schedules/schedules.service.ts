import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../config/database.module";

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async setWorkingHours(providerId: string, data: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDuration: number;
  }) {
    return this.prisma.workingHours.upsert({
      where: {
        providerId_dayOfWeek: {
          providerId,
          dayOfWeek: data.dayOfWeek as any,
        },
      },
      update: data as any,
      create: { providerId, ...data } as any,
    });
  }

  async getWorkingHours(providerId: string) {
    return this.prisma.workingHours.findMany({
      where: { providerId },
      orderBy: { dayOfWeek: "asc" },
    });
  }

  async addException(providerId: string, data: {
    date: Date;
    startTime?: string;
    endTime?: string;
    isBlocked?: boolean;
    reason?: string;
  }) {
    return this.prisma.scheduleException.create({
      data: { providerId, ...data },
    });
  }

  async getExceptions(providerId: string) {
    return this.prisma.scheduleException.findMany({
      where: { providerId },
      orderBy: { date: "asc" },
    });
  }

  /**
   * Compute available time slots for a given provider+date,
   * factoring in working hours, exceptions, and existing appointments.
   * (FR-PD-13)
   */
  async getAvailableSlots(providerId: string, date: Date, serviceDuration: number) {
    const dayOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][date.getDay()];

    // Get working hours for this day
    const hours = await this.prisma.workingHours.findUnique({
      where: { providerId_dayOfWeek: { providerId, dayOfWeek: dayOfWeek as any } },
    });

    if (!hours) return [];

    // Check for exceptions
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const exception = await this.prisma.scheduleException.findFirst({
      where: { providerId, date: { gte: startOfDay, lte: endOfDay } },
    });

    if (exception?.isBlocked) return [];

    // Get existing appointments for this day
    const appointments = await this.prisma.appointment.findMany({
      where: {
        providerId,
        slotStart: { gte: startOfDay, lte: endOfDay },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    // Generate slots
    const slots: { start: Date; end: Date; isAvailable: boolean }[] = [];
    const [startH, startM] = hours.startTime.split(":").map(Number);
    const [endH, endM] = hours.endTime.split(":").map(Number);

    const slotStart = new Date(date);
    slotStart.setHours(startH, startM, 0, 0);
    const workEnd = new Date(date);
    workEnd.setHours(endH, endM, 0, 0);

    while (slotStart.getTime() + serviceDuration * 60000 <= workEnd.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
      const isBooked = appointments.some(
        (apt) => apt.slotStart < slotEnd && apt.slotEnd > slotStart,
      );

      slots.push({
        start: new Date(slotStart),
        end: slotEnd,
        isAvailable: !isBooked,
      });

      slotStart.setMinutes(slotStart.getMinutes() + hours.slotDuration);
    }

    return slots;
  }
}

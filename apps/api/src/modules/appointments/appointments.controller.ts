import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Res,
  Header,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";

import { AppointmentsService } from "./appointments.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Appointments")
@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: "Book an appointment (public)" })
  create(@Body() dto: {
    serviceId: string;
    providerId?: string;
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    slotStart: string;
    slotEnd: string;
    formData?: Record<string, unknown>;
  }) {
    return this.appointmentsService.create({
      ...dto,
      slotStart: new Date(dto.slotStart),
      slotEnd: new Date(dto.slotEnd),
    });
  }

  @Public()
  @Get("booked-slots")
  @ApiOperation({ summary: "Get booked time slots for a provider on a date (public)" })
  getBookedSlots(
    @Query("providerId") providerId: string,
    @Query("date") date: string,
  ) {
    return this.appointmentsService.getBookedSlots(providerId, date);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "List appointments with filters" })
  findAll(
    @Query("status") status?: string,
    @Query("page") page?: number,
    @Query("pageSize") pageSize?: number,
  ) {
    return this.appointmentsService.findAll({ status, page, pageSize });
  }

  @UseGuards(JwtAuthGuard)
  @Get("export/csv")
  @ApiBearerAuth()
  @Header("Content-Type", "text/csv")
  @ApiOperation({ summary: "Export appointments as CSV (FR-PD-19)" })
  async exportCsv(@Res() res: Response) {
    const csv = await this.appointmentsService.exportCsv();
    res.setHeader("Content-Disposition", "attachment; filename=appointments.csv");
    res.send(csv);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get appointment by ID" })
  findOne(@Param("id") id: string) {
    return this.appointmentsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/status")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update appointment status" })
  updateStatus(
    @Param("id") id: string,
    @Body() dto: { status: "CONFIRMED" | "COMPLETED" | "CANCELLED" },
  ) {
    return this.appointmentsService.updateStatus(id, dto.status);
  }
}

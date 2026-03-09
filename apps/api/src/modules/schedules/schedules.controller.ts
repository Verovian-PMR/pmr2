import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

import { SchedulesService } from "./schedules.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Schedules")
@Controller("schedules")
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @UseGuards(JwtAuthGuard)
  @Post("providers/:providerId/hours")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Set working hours for a provider" })
  setHours(
    @Param("providerId") providerId: string,
    @Body() dto: { dayOfWeek: string; startTime: string; endTime: string; slotDuration: number },
  ) {
    return this.schedulesService.setWorkingHours(providerId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("providers/:providerId/hours")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get working hours for a provider" })
  getHours(@Param("providerId") providerId: string) {
    return this.schedulesService.getWorkingHours(providerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("providers/:providerId/exceptions")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add schedule exception (holiday/leave)" })
  addException(
    @Param("providerId") providerId: string,
    @Body() dto: { date: Date; startTime?: string; endTime?: string; isBlocked?: boolean; reason?: string },
  ) {
    return this.schedulesService.addException(providerId, dto);
  }

  @Public()
  @Get("providers/:providerId/slots")
  @ApiOperation({ summary: "Get available time slots (public)" })
  getSlots(
    @Param("providerId") providerId: string,
    @Query("date") date: string,
    @Query("duration") duration: number,
  ) {
    return this.schedulesService.getAvailableSlots(providerId, new Date(date), duration);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

import { ServicesService } from "./services.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Services")
@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "List services (public: active only)" })
  findAll(@Query("includeInactive") includeInactive?: boolean) {
    return this.servicesService.findAll(includeInactive);
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Get service by ID" })
  findOne(@Param("id") id: string) {
    return this.servicesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a service" })
  create(@Body() dto: { name: string; description: string; duration: number; featuredImageUrl?: string }) {
    return this.servicesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a service" })
  update(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
    return this.servicesService.update(id, dto as any);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a service" })
  remove(@Param("id") id: string) {
    return this.servicesService.delete(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

import { ComponentsService } from "./components.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Components & Pages")
@Controller()
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  // ── Site Settings ─────────────────────────────────────────────
  @Public()
  @Get("site-settings")
  @ApiOperation({ summary: "Get site settings (GlobalSettings JSON)" })
  getSiteSettings() {
    return this.componentsService.getSiteSettings();
  }

  @Patch("site-settings")
  @ApiOperation({ summary: "Update site settings" })
  updateSiteSettings(@Body() dto: Record<string, unknown>) {
    return this.componentsService.updateSiteSettings(dto);
  }

  // ── Pages ─────────────────────────────────────────────────────
  @Public()
  @Get("pages")
  @ApiOperation({ summary: "List all pages with components" })
  getAllPages() {
    return this.componentsService.getAllPages();
  }

  @Public()
  @Get("pages/:slug")
  @ApiOperation({ summary: "Get page with components by slug" })
  getPage(@Param("slug") slug: string) {
    return this.componentsService.getPageWithComponents(slug);
  }

  @Patch("pages/:slug")
  @ApiOperation({ summary: "Update page settings (SEO, visibility)" })
  updatePage(@Param("slug") slug: string, @Body() dto: Record<string, unknown>) {
    return this.componentsService.updatePage(slug, dto as any);
  }

  @Put("pages/bulk")
  @ApiOperation({ summary: "Bulk save all pages with components" })
  bulkSavePages(@Body() dto: { pages: any[] }) {
    return this.componentsService.bulkSavePages(dto.pages);
  }

  @Post("pages/:slug/components")
  @ApiOperation({ summary: "Add component to page" })
  async addComponent(
    @Param("slug") slug: string,
    @Body() dto: { type: string; defId: string; config: Record<string, unknown> },
  ) {
    const page = await this.componentsService.getPageWithComponents(slug);
    return this.componentsService.addComponent(page.id, dto);
  }

  @Patch("components/:id")
  @ApiOperation({ summary: "Update component config/order" })
  updateComponent(
    @Param("id") id: string,
    @Body() dto: { config?: Record<string, unknown>; order?: number },
  ) {
    return this.componentsService.updateComponent(id, dto);
  }

  @Delete("components/:id")
  @ApiOperation({ summary: "Delete component" })
  deleteComponent(@Param("id") id: string) {
    return this.componentsService.deleteComponent(id);
  }

  // ── Services Data (JSON blob for public-site) ─────────────────
  @Public()
  @Get("services-data")
  @ApiOperation({ summary: "Get services data (JSON array for public-site)" })
  getServicesData() {
    return this.componentsService.getServicesData();
  }

  @Patch("services-data")
  @ApiOperation({ summary: "Update services data" })
  updateServicesData(@Body() dto: unknown[]) {
    return this.componentsService.updateServicesData(dto);
  }

  // ── Providers Data (JSON blob for public-site booking) ───────
  @Public()
  @Get("providers-data")
  @ApiOperation({ summary: "Get providers data (JSON array for public-site booking)" })
  getProvidersData() {
    return this.componentsService.getProvidersData();
  }

  @Patch("providers-data")
  @ApiOperation({ summary: "Update providers data" })
  updateProvidersData(@Body() dto: unknown[]) {
    return this.componentsService.updateProvidersData(dto);
  }

  // ── Appointments Data (JSON blob for public-site booking) ────
  @Public()
  @Get("appointments-data")
  @ApiOperation({ summary: "Get appointments data (JSON array for public-site booking)" })
  getAppointmentsData() {
    return this.componentsService.getAppointmentsData();
  }

  @Patch("appointments-data")
  @ApiOperation({ summary: "Update appointments data" })
  updateAppointmentsData(@Body() dto: unknown[]) {
    return this.componentsService.updateAppointmentsData(dto);
  }

  // ── Brand Settings ────────────────────────────────────────────
  @Public()
  @Get("brand/settings")
  @ApiOperation({ summary: "Get brand settings (public)" })
  getBrand() {
    return this.componentsService.getBrandSettings();
  }

  @Patch("brand/settings")
  @ApiOperation({ summary: "Update brand settings" })
  updateBrand(@Body() dto: Record<string, unknown>) {
    return this.componentsService.updateBrandSettings(dto as any);
  }
}

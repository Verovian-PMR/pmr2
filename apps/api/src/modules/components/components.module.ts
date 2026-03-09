import { Module } from "@nestjs/common";

import { ComponentsService } from "./components.service";
import { ComponentsController } from "./components.controller";

@Module({
  controllers: [ComponentsController],
  providers: [ComponentsService],
  exports: [ComponentsService],
})
export class ComponentsModule {}

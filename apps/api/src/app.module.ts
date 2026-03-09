import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ServicesModule } from "./modules/services/services.module";
import { SchedulesModule } from "./modules/schedules/schedules.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";
import { ComponentsModule } from "./modules/components/components.module";
import { AuditModule } from "./modules/audit/audit.module";
import { HealthModule } from "./modules/health/health.module";
import { DatabaseModule } from "./config/database.module";

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // Rate limiting (SEC: DDoS prevention)
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || "60") * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || "100"),
      },
    ]),

    // Database
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ServicesModule,
    SchedulesModule,
    AppointmentsModule,
    ComponentsModule,
    AuditModule,
    HealthModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

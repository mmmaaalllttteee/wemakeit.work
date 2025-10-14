import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { ProjectModule } from './modules/project/project.module';
import { FilesModule } from './modules/files/files.module';
import { SharesModule } from './modules/shares/shares.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { MoodboardModule } from './modules/moodboard/moodboard.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { CmsModule } from './modules/cms/cms.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ActivityModule } from './modules/activity/activity.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    OrganizationModule,
    ProjectModule,
    FilesModule,
    SharesModule,
    DashboardModule,
    TemplatesModule,
    MoodboardModule,
    AnalyticsModule,
    ContractsModule,
    RealtimeModule,
    CmsModule,
    InvitationsModule,
    AuditModule,
    NotificationsModule,
    ActivityModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

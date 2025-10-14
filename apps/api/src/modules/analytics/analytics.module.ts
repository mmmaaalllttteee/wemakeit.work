import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { OAuthService } from './oauth.service';
import { AnalyticsConnection } from './entities/connection.entity';
import { AnalyticsMetric } from './entities/metric.entity';
import { AnalyticsSyncLog } from './entities/sync-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsConnection, AnalyticsMetric, AnalyticsSyncLog])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, OAuthService],
  exports: [AnalyticsService, OAuthService],
})
export class AnalyticsModule {}

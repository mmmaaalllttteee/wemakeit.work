import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import {
  ConnectProviderDto,
  UpdateConnectionDto,
  SyncMetricsDto,
  GetMetricsDto,
  AggregateMetricsDto,
  CreateMetricDto,
} from './dto/analytics.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ==================== OAuth & Connections ====================

  @Get('auth/:provider')
  @ApiOperation({ summary: 'Get OAuth authorization URL' })
  getAuthUrl(
    @Param('provider') provider: string,
    @Query('redirectUri') redirectUri: string,
    @Query('state') state?: string,
  ) {
    const authUrl = this.analyticsService.getAuthUrl(provider, redirectUri, state);
    return { authUrl };
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect a new analytics provider' })
  async connectProvider(@Body() dto: ConnectProviderDto, @Request() req) {
    return this.analyticsService.connectProvider(dto, req.user.userId, req.user.orgId);
  }

  @Get('connections')
  @ApiOperation({ summary: 'Get all analytics connections' })
  async getConnections(@Request() req) {
    return this.analyticsService.getConnections(req.user.orgId);
  }

  @Get('connections/:id')
  @ApiOperation({ summary: 'Get a specific connection' })
  async getConnection(@Param('id') id: string, @Request() req) {
    return this.analyticsService.getConnection(id, req.user.orgId);
  }

  @Patch('connections/:id')
  @ApiOperation({ summary: 'Update connection settings' })
  async updateConnection(
    @Param('id') id: string,
    @Body() dto: UpdateConnectionDto,
    @Request() req,
  ) {
    return this.analyticsService.updateConnection(id, dto, req.user.orgId);
  }

  @Delete('connections/:id')
  @ApiOperation({ summary: 'Disconnect analytics provider' })
  async disconnectProvider(@Param('id') id: string, @Request() req) {
    await this.analyticsService.disconnectProvider(id, req.user.orgId);
    return { message: 'Provider disconnected successfully' };
  }

  @Post('connections/:id/refresh')
  @ApiOperation({ summary: 'Refresh expired access token' })
  async refreshToken(@Param('id') id: string, @Request() req) {
    return this.analyticsService.refreshToken(id, req.user.orgId);
  }

  // ==================== Metrics ====================

  @Post('sync')
  @ApiOperation({ summary: 'Sync metrics from a provider' })
  async syncMetrics(@Body() dto: SyncMetricsDto, @Request() req) {
    return this.analyticsService.syncMetrics(dto, req.user.orgId);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get metrics' })
  async getMetrics(
    @Query('connectionId') connectionId: string,
    @Query('projectId') projectId: string,
    @Query('metricTypes') metricTypes: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity: 'day' | 'week' | 'month',
    @Request() req,
  ) {
    const dto: GetMetricsDto = {
      connectionId,
      projectId,
      metricTypes: metricTypes ? metricTypes.split(',') : undefined,
      startDate,
      endDate,
      granularity,
    };
    return this.analyticsService.getMetrics(dto, req.user.orgId);
  }

  @Post('metrics/aggregate')
  @ApiOperation({ summary: 'Get aggregated metrics' })
  async aggregateMetrics(@Body() dto: AggregateMetricsDto, @Request() req) {
    return this.analyticsService.aggregateMetrics(dto, req.user.orgId);
  }

  @Post('metrics')
  @ApiOperation({ summary: 'Create manual metric entry' })
  async createMetric(@Body() dto: CreateMetricDto, @Request() req) {
    return this.analyticsService.createMetric(dto, req.user.orgId);
  }

  @Get('connections/:id/sync-logs')
  @ApiOperation({ summary: 'Get sync logs for a connection' })
  async getSyncLogs(@Param('id') id: string, @Request() req) {
    return this.analyticsService.getSyncLogs(id, req.user.orgId);
  }
}

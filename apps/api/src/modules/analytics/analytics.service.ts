import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { AnalyticsConnection } from './entities/connection.entity';
import { AnalyticsMetric } from './entities/metric.entity';
import { AnalyticsSyncLog } from './entities/sync-log.entity';
import { OAuthService } from './oauth.service';
import {
  ConnectProviderDto,
  UpdateConnectionDto,
  SyncMetricsDto,
  GetMetricsDto,
  AggregateMetricsDto,
  CreateMetricDto,
} from './dto/analytics.dto';
import axios from 'axios';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsConnection)
    private connectionRepository: Repository<AnalyticsConnection>,
    @InjectRepository(AnalyticsMetric)
    private metricRepository: Repository<AnalyticsMetric>,
    @InjectRepository(AnalyticsSyncLog)
    private syncLogRepository: Repository<AnalyticsSyncLog>,
    private oauthService: OAuthService,
  ) {}

  // ==================== Connections ====================

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthUrl(provider: string, redirectUri: string, state?: string): string {
    return this.oauthService.getAuthorizationUrl(provider, redirectUri, state);
  }

  /**
   * Connect a new analytics provider
   */
  async connectProvider(
    dto: ConnectProviderDto,
    userId: string,
    orgId: string,
  ): Promise<AnalyticsConnection> {
    // Exchange code for tokens
    const tokens = await this.oauthService.exchangeCodeForTokens(
      dto.provider,
      dto.code,
      dto.redirectUri || `${process.env.FRONTEND_URL}/settings/integrations/callback`,
    );

    // Fetch account information
    const accountInfo = await this.fetchAccountInfo(dto.provider, tokens.accessToken);

    // Create connection
    const connection = this.connectionRepository.create({
      orgId,
      provider: dto.provider,
      accountName: accountInfo.name,
      accountId: accountInfo.id,
      profileId: accountInfo.profileId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: tokens.expiresAt,
      metadata: {
        scope: tokens.scope,
        ...accountInfo.metadata,
      },
      status: 'active',
      createdBy: userId,
    });

    return this.connectionRepository.save(connection);
  }

  /**
   * Get all connections for an organization
   */
  async getConnections(orgId: string): Promise<AnalyticsConnection[]> {
    return this.connectionRepository.find({
      where: { orgId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a specific connection
   */
  async getConnection(id: string, orgId: string): Promise<AnalyticsConnection> {
    const connection = await this.connectionRepository.findOne({
      where: { id, orgId },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    return connection;
  }

  /**
   * Update connection
   */
  async updateConnection(
    id: string,
    dto: UpdateConnectionDto,
    orgId: string,
  ): Promise<AnalyticsConnection> {
    const connection = await this.getConnection(id, orgId);
    Object.assign(connection, dto);
    return this.connectionRepository.save(connection);
  }

  /**
   * Disconnect (delete) a connection
   */
  async disconnectProvider(id: string, orgId: string): Promise<void> {
    const connection = await this.getConnection(id, orgId);

    // Revoke token
    if (connection.accessToken) {
      await this.oauthService.revokeToken(connection.provider, connection.accessToken);
    }

    await this.connectionRepository.remove(connection);
  }

  /**
   * Refresh expired token
   */
  async refreshToken(id: string, orgId: string): Promise<AnalyticsConnection> {
    const connection = await this.getConnection(id, orgId);

    if (!connection.refreshToken) {
      throw new BadRequestException('No refresh token available');
    }

    try {
      const tokens = await this.oauthService.refreshAccessToken(
        connection.provider,
        connection.refreshToken,
      );

      connection.accessToken = tokens.accessToken;
      if (tokens.refreshToken) {
        connection.refreshToken = tokens.refreshToken;
      }
      connection.tokenExpiresAt = tokens.expiresAt;
      connection.status = 'active';

      return this.connectionRepository.save(connection);
    } catch (error) {
      connection.status = 'error';
      connection.lastSyncError = error instanceof Error ? error.message : 'Token refresh failed';
      await this.connectionRepository.save(connection);
      throw error;
    }
  }

  // ==================== Metrics ====================

  /**
   * Sync metrics from provider
   */
  async syncMetrics(dto: SyncMetricsDto, orgId: string): Promise<AnalyticsSyncLog> {
    const connection = await this.getConnection(dto.connectionId, orgId);

    // Create sync log
    const syncLog = this.syncLogRepository.create({
      connectionId: connection.id,
      status: 'started',
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      recordsProcessed: 0,
      recordsFailed: 0,
    });
    await this.syncLogRepository.save(syncLog);

    const startTime = Date.now();

    try {
      // Refresh token if expired
      if (connection.tokenExpiresAt && new Date() >= connection.tokenExpiresAt) {
        await this.refreshToken(connection.id, orgId);
        // Reload connection with new token
        Object.assign(connection, await this.getConnection(connection.id, orgId));
      }

      // Fetch metrics from provider
      const metrics = await this.fetchMetricsFromProvider(
        connection,
        dto.startDate,
        dto.endDate,
        dto.metricTypes,
      );

      // Save metrics
      let processed = 0;
      let failed = 0;

      for (const metricData of metrics) {
        try {
          const metric = this.metricRepository.create({
            connectionId: connection.id,
            projectId: dto.projectId,
            metricType: metricData.type,
            value: metricData.value,
            date: metricData.date,
            dimensions: metricData.dimensions,
            metadata: metricData.metadata,
          });
          await this.metricRepository.save(metric);
          processed++;
        } catch (error) {
          console.error('Failed to save metric:', error);
          failed++;
        }
      }

      // Update sync log
      syncLog.status = failed === 0 ? 'success' : 'partial';
      syncLog.recordsProcessed = processed;
      syncLog.recordsFailed = failed;
      syncLog.durationMs = Date.now() - startTime;
      syncLog.completedAt = new Date();

      // Update connection
      connection.lastSyncAt = new Date();
      connection.lastSyncError = null;
      await this.connectionRepository.save(connection);
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      syncLog.errorDetails = error;
      syncLog.durationMs = Date.now() - startTime;
      syncLog.completedAt = new Date();

      connection.lastSyncError = syncLog.errorMessage;
      await this.connectionRepository.save(connection);
    }

    return this.syncLogRepository.save(syncLog);
  }

  /**
   * Get metrics
   */
  async getMetrics(dto: GetMetricsDto, orgId: string): Promise<AnalyticsMetric[]> {
    const where: any = {
      date: Between(new Date(dto.startDate), new Date(dto.endDate)),
    };

    if (dto.connectionId) {
      const connection = await this.getConnection(dto.connectionId, orgId);
      where.connectionId = connection.id;
    }

    if (dto.projectId) {
      where.projectId = dto.projectId;
    }

    if (dto.metricTypes && dto.metricTypes.length > 0) {
      where.metricType = In(dto.metricTypes);
    }

    if (dto.dimensions) {
      // TODO: Add JSONB query for dimensions
    }

    return this.metricRepository.find({
      where,
      order: { date: 'ASC' },
      relations: ['connection'],
    });
  }

  /**
   * Aggregate metrics
   */
  async aggregateMetrics(dto: AggregateMetricsDto, orgId: string): Promise<Record<string, number>> {
    const metrics = await this.getMetrics(
      {
        projectId: dto.projectId,
        metricTypes: dto.metricTypes,
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
      orgId,
    );

    const aggregation = dto.aggregation || 'sum';
    const result: Record<string, number> = {};

    for (const metricType of dto.metricTypes) {
      const values = metrics.filter((m) => m.metricType === metricType).map((m) => m.value);

      if (values.length === 0) {
        result[metricType] = 0;
        continue;
      }

      switch (aggregation) {
        case 'sum':
          result[metricType] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result[metricType] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'min':
          result[metricType] = Math.min(...values);
          break;
        case 'max':
          result[metricType] = Math.max(...values);
          break;
        case 'last':
          result[metricType] = values[values.length - 1];
          break;
      }
    }

    return result;
  }

  /**
   * Create manual metric entry
   */
  async createMetric(dto: CreateMetricDto, orgId: string): Promise<AnalyticsMetric> {
    const connection = await this.getConnection(dto.connectionId, orgId);

    const metric = this.metricRepository.create({
      connectionId: connection.id,
      projectId: dto.projectId,
      metricType: dto.metricType,
      value: dto.value,
      date: new Date(dto.date),
      dimensions: dto.dimensions,
      metadata: dto.metadata,
    });

    return this.metricRepository.save(metric);
  }

  /**
   * Get sync logs
   */
  async getSyncLogs(connectionId: string, orgId: string): Promise<AnalyticsSyncLog[]> {
    const connection = await this.getConnection(connectionId, orgId);

    return this.syncLogRepository.find({
      where: { connectionId: connection.id },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  // ==================== Private Helper Methods ====================

  /**
   * Fetch account information from provider
   */
  private async fetchAccountInfo(
    provider: string,
    accessToken: string,
  ): Promise<{ id: string; name: string; profileId?: string; metadata?: any }> {
    try {
      switch (provider) {
        case 'google_analytics':
        case 'youtube': {
          const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          return {
            id: response.data.id,
            name: response.data.email,
            metadata: { email: response.data.email },
          };
        }

        case 'meta_business':
        case 'instagram': {
          const response = await axios.get('https://graph.facebook.com/v18.0/me', {
            params: { fields: 'id,name,email', access_token: accessToken },
          });
          return {
            id: response.data.id,
            name: response.data.name || response.data.email,
            metadata: { email: response.data.email },
          };
        }

        case 'spotify': {
          const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          return {
            id: response.data.id,
            name: response.data.display_name || response.data.email,
            metadata: { email: response.data.email },
          };
        }

        default:
          return {
            id: 'unknown',
            name: `${provider} account`,
          };
      }
    } catch (error) {
      console.error(`Failed to fetch account info for ${provider}:`, error);
      return {
        id: 'unknown',
        name: `${provider} account`,
      };
    }
  }

  /**
   * Fetch metrics from provider API
   */
  private async fetchMetricsFromProvider(
    connection: AnalyticsConnection,
    startDate: string,
    endDate: string,
    metricTypes?: string[],
  ): Promise<Array<{ type: string; value: number; date: Date; dimensions?: any; metadata?: any }>> {
    // This is a placeholder - actual implementation would call provider APIs
    // Each provider has different API structures

    switch (connection.provider) {
      case 'google_analytics':
        return this.fetchGoogleAnalyticsMetrics(connection, startDate, endDate, metricTypes);
      case 'youtube':
        return this.fetchYouTubeMetrics(connection, startDate, endDate, metricTypes);
      case 'spotify':
        return this.fetchSpotifyMetrics(connection, startDate, endDate, metricTypes);
      // Add other providers
      default:
        console.warn(`Metrics fetching not implemented for ${connection.provider}`);
        return [];
    }
  }

  private async fetchGoogleAnalyticsMetrics(
    connection: AnalyticsConnection,
    startDate: string,
    endDate: string,
    metricTypes?: string[],
  ): Promise<Array<{ type: string; value: number; date: Date; dimensions?: any; metadata?: any }>> {
    // Placeholder for GA4 Data API integration
    // Would use @google-analytics/data package
    return [];
  }

  private async fetchYouTubeMetrics(
    connection: AnalyticsConnection,
    startDate: string,
    endDate: string,
    metricTypes?: string[],
  ): Promise<Array<{ type: string; value: number; date: Date; dimensions?: any; metadata?: any }>> {
    // Placeholder for YouTube Analytics API integration
    return [];
  }

  private async fetchSpotifyMetrics(
    connection: AnalyticsConnection,
    startDate: string,
    endDate: string,
    metricTypes?: string[],
  ): Promise<Array<{ type: string; value: number; date: Date; dimensions?: any; metadata?: any }>> {
    // Placeholder for Spotify API integration
    return [];
  }
}

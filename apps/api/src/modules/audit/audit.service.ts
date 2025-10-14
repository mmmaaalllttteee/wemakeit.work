import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto, QueryAuditLogsDto } from './dto/audit.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create a new audit log entry
   */
  async log(
    orgId: string,
    userId: string,
    userName: string,
    dto: CreateAuditLogDto,
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      orgId,
      userId,
      userName,
      ...dto,
      status: dto.status || 'success',
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Query audit logs with filters
   */
  async queryLogs(
    orgId: string,
    dto: QueryAuditLogsDto,
  ): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page = 1, pageSize = 50, startDate, endDate, ...filters } = dto;

    const where: any = { orgId, ...filters };

    // Handle date range filtering
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(new Date(endDate));
    }

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get audit log by ID
   */
  async getLog(id: string, orgId: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findOne({
      where: { id, orgId },
    });
  }

  /**
   * Get audit logs for a specific resource
   */
  async getResourceLogs(
    orgId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { orgId, resourceType, resourceId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserLogs(orgId: string, userId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { orgId, userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get statistics about audit logs
   */
  async getStats(
    orgId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByUser: Record<string, number>;
    actionsByStatus: Record<string, number>;
    topActions: Array<{ action: string; count: number }>;
  }> {
    const where: any = { orgId };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }

    const logs = await this.auditLogRepository.find({ where });

    // Calculate statistics
    const actionsByType: Record<string, number> = {};
    const actionsByUser: Record<string, number> = {};
    const actionsByStatus: Record<string, number> = {};
    const actionCounts: Record<string, number> = {};

    for (const log of logs) {
      // Count by resource type
      actionsByType[log.resourceType] = (actionsByType[log.resourceType] || 0) + 1;

      // Count by user
      actionsByUser[log.userName] = (actionsByUser[log.userName] || 0) + 1;

      // Count by status
      actionsByStatus[log.status] = (actionsByStatus[log.status] || 0) + 1;

      // Count by action
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    }

    // Get top 10 actions
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActions: logs.length,
      actionsByType,
      actionsByUser,
      actionsByStatus,
      topActions,
    };
  }

  /**
   * Clean up old audit logs (retention policy)
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Export audit logs to CSV format
   */
  async exportLogs(orgId: string, dto: QueryAuditLogsDto): Promise<string> {
    const { logs } = await this.queryLogs(orgId, { ...dto, pageSize: 10000 });

    const headers = [
      'Timestamp',
      'User',
      'Action',
      'Resource Type',
      'Resource ID',
      'Status',
      'IP Address',
    ];

    const rows = logs.map((log) => [
      log.createdAt.toISOString(),
      log.userName,
      log.action,
      log.resourceType,
      log.resourceId || '',
      log.status,
      log.ipAddress || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    return csv;
  }
}

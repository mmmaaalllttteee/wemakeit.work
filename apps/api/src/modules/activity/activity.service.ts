import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto, QueryActivitiesDto } from './dto/activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  /**
   * Create a new activity
   */
  async create(
    orgId: string,
    userId: string,
    userName: string,
    userAvatar: string | null,
    dto: CreateActivityDto,
  ): Promise<Activity> {
    const activity = this.activityRepository.create({
      orgId,
      userId,
      userName,
      userAvatar,
      ...dto,
    });

    return this.activityRepository.save(activity);
  }

  /**
   * Query activities with filters
   */
  async query(
    orgId: string,
    dto: QueryActivitiesDto,
  ): Promise<{
    activities: Activity[];
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

    const [activities, total] = await this.activityRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      activities,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get recent activities for organization
   */
  async getRecent(orgId: string, limit: number = 50): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { orgId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get activities for a specific project
   */
  async getProjectActivities(
    orgId: string,
    projectId: string,
    limit: number = 100,
  ): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { orgId, projectId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get activities by a specific user
   */
  async getUserActivities(orgId: string, userId: string, limit: number = 100): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { orgId, userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get important activities (milestones, signatures, etc.)
   */
  async getImportantActivities(orgId: string, limit: number = 50): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { orgId, isImportant: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get activity statistics
   */
  async getStats(
    orgId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalActivities: number;
    activitiesByAction: Record<string, number>;
    activitiesByResourceType: Record<string, number>;
    activitiesByUser: Record<string, number>;
    topUsers: Array<{ userName: string; count: number }>;
  }> {
    const where: any = { orgId };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }

    const activities = await this.activityRepository.find({ where });

    // Calculate statistics
    const activitiesByAction: Record<string, number> = {};
    const activitiesByResourceType: Record<string, number> = {};
    const activitiesByUser: Record<string, number> = {};

    for (const activity of activities) {
      // Count by action
      activitiesByAction[activity.action] = (activitiesByAction[activity.action] || 0) + 1;

      // Count by resource type
      activitiesByResourceType[activity.resourceType] =
        (activitiesByResourceType[activity.resourceType] || 0) + 1;

      // Count by user
      activitiesByUser[activity.userName] = (activitiesByUser[activity.userName] || 0) + 1;
    }

    // Get top 10 active users
    const topUsers = Object.entries(activitiesByUser)
      .map(([userName, count]) => ({ userName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActivities: activities.length,
      activitiesByAction,
      activitiesByResourceType,
      activitiesByUser,
      topUsers,
    };
  }

  /**
   * Get activity timeline grouped by date
   */
  async getTimeline(
    orgId: string,
    days: number = 7,
  ): Promise<
    Array<{
      date: string;
      activities: Activity[];
      count: number;
    }>
  > {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.activityRepository.find({
      where: {
        orgId,
        createdAt: MoreThanOrEqual(startDate),
      },
      order: { createdAt: 'DESC' },
    });

    // Group by date
    const grouped = new Map<string, Activity[]>();

    for (const activity of activities) {
      const date = activity.createdAt.toISOString().split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(activity);
    }

    // Convert to array
    return Array.from(grouped.entries()).map(([date, activities]) => ({
      date,
      activities,
      count: activities.length,
    }));
  }

  /**
   * Clean up old activities (retention policy)
   */
  async cleanupOldActivities(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.activityRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { UpdateNotificationPreferencesDto } from './dto/notification-preferences.dto';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    @InjectRepository(NotificationPreferences)
    private preferencesRepository: Repository<NotificationPreferences>,
  ) {}

  /**
   * Get or create notification preferences for user
   */
  async getOrCreate(userId: string, orgId: string): Promise<NotificationPreferences> {
    let preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = this.preferencesRepository.create({
        userId,
        orgId,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        emailPreferences: {
          projectUpdates: true,
          fileComments: true,
          mentions: true,
          taskAssignments: true,
          contractSignatures: true,
          teamInvitations: true,
          analyticsReports: false,
          systemAnnouncements: true,
        },
        pushPreferences: {
          projectUpdates: true,
          fileComments: true,
          mentions: true,
          taskAssignments: true,
          contractSignatures: true,
          teamInvitations: true,
          realtimeCollaboration: true,
        },
        inAppPreferences: {
          projectUpdates: true,
          fileComments: true,
          mentions: true,
          taskAssignments: true,
          contractSignatures: true,
          teamInvitations: true,
          realtimeCollaboration: true,
          systemAnnouncements: true,
        },
        dailyDigest: false,
        weeklyDigest: false,
        doNotDisturb: false,
        mutedProjects: [],
        mutedUsers: [],
      });

      preferences = await this.preferencesRepository.save(preferences);
    }

    return preferences;
  }

  /**
   * Update notification preferences
   */
  async update(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferences> {
    const preferences = await this.getOrCreate(userId, ''); // orgId will be set if creating

    // Merge preferences deeply
    if (dto.emailPreferences) {
      preferences.emailPreferences = {
        ...preferences.emailPreferences,
        ...dto.emailPreferences,
      };
    }

    if (dto.pushPreferences) {
      preferences.pushPreferences = {
        ...preferences.pushPreferences,
        ...dto.pushPreferences,
      };
    }

    if (dto.inAppPreferences) {
      preferences.inAppPreferences = {
        ...preferences.inAppPreferences,
        ...dto.inAppPreferences,
      };
    }

    // Update other fields
    Object.keys(dto).forEach((key) => {
      if (key !== 'emailPreferences' && key !== 'pushPreferences' && key !== 'inAppPreferences') {
        preferences[key] = dto[key];
      }
    });

    return this.preferencesRepository.save(preferences);
  }

  /**
   * Mute a project
   */
  async muteProject(userId: string, projectId: string): Promise<NotificationPreferences> {
    const preferences = await this.getOrCreate(userId, '');

    if (!preferences.mutedProjects) {
      preferences.mutedProjects = [];
    }

    if (!preferences.mutedProjects.includes(projectId)) {
      preferences.mutedProjects.push(projectId);
    }

    return this.preferencesRepository.save(preferences);
  }

  /**
   * Unmute a project
   */
  async unmuteProject(userId: string, projectId: string): Promise<NotificationPreferences> {
    const preferences = await this.getOrCreate(userId, '');

    if (preferences.mutedProjects) {
      preferences.mutedProjects = preferences.mutedProjects.filter((id) => id !== projectId);
    }

    return this.preferencesRepository.save(preferences);
  }

  /**
   * Mute a user
   */
  async muteUser(userId: string, targetUserId: string): Promise<NotificationPreferences> {
    const preferences = await this.getOrCreate(userId, '');

    if (!preferences.mutedUsers) {
      preferences.mutedUsers = [];
    }

    if (!preferences.mutedUsers.includes(targetUserId)) {
      preferences.mutedUsers.push(targetUserId);
    }

    return this.preferencesRepository.save(preferences);
  }

  /**
   * Unmute a user
   */
  async unmuteUser(userId: string, targetUserId: string): Promise<NotificationPreferences> {
    const preferences = await this.getOrCreate(userId, '');

    if (preferences.mutedUsers) {
      preferences.mutedUsers = preferences.mutedUsers.filter((id) => id !== targetUserId);
    }

    return this.preferencesRepository.save(preferences);
  }

  /**
   * Check if notifications should be sent based on preferences
   */
  async shouldNotify(
    userId: string,
    notificationType: string,
    channel: 'email' | 'push' | 'inApp',
    context?: {
      projectId?: string;
      fromUserId?: string;
    },
  ): Promise<boolean> {
    const preferences = await this.getOrCreate(userId, '');

    // Check if channel is enabled
    if (channel === 'email' && !preferences.emailEnabled) {return false;}
    if (channel === 'push' && !preferences.pushEnabled) {return false;}
    if (channel === 'inApp' && !preferences.inAppEnabled) {return false;}

    // Check Do Not Disturb
    if (preferences.doNotDisturb && this.isInDoNotDisturbPeriod(preferences)) {
      return false;
    }

    // Check muted projects
    if (context?.projectId && preferences.mutedProjects?.includes(context.projectId)) {
      return false;
    }

    // Check muted users
    if (context?.fromUserId && preferences.mutedUsers?.includes(context.fromUserId)) {
      return false;
    }

    // Check specific notification type preference
    const channelPreferences =
      channel === 'email'
        ? preferences.emailPreferences
        : channel === 'push'
          ? preferences.pushPreferences
          : preferences.inAppPreferences;

    return channelPreferences?.[notificationType] !== false;
  }

  /**
   * Check if current time is in Do Not Disturb period
   */
  private isInDoNotDisturbPeriod(preferences: NotificationPreferences): boolean {
    if (!preferences.doNotDisturbStart || !preferences.doNotDisturbEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const start = preferences.doNotDisturbStart;
    const end = preferences.doNotDisturbEnd;

    // Handle overnight period (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }

    // Handle same-day period (e.g., 12:00 to 14:00)
    return currentTime >= start && currentTime <= end;
  }

  /**
   * Reset preferences to defaults
   */
  async resetToDefaults(userId: string): Promise<NotificationPreferences> {
    const preferences = await this.getOrCreate(userId, '');

    preferences.emailEnabled = true;
    preferences.pushEnabled = true;
    preferences.inAppEnabled = true;
    preferences.emailPreferences = {
      projectUpdates: true,
      fileComments: true,
      mentions: true,
      taskAssignments: true,
      contractSignatures: true,
      teamInvitations: true,
      analyticsReports: false,
      systemAnnouncements: true,
    };
    preferences.pushPreferences = {
      projectUpdates: true,
      fileComments: true,
      mentions: true,
      taskAssignments: true,
      contractSignatures: true,
      teamInvitations: true,
      realtimeCollaboration: true,
    };
    preferences.inAppPreferences = {
      projectUpdates: true,
      fileComments: true,
      mentions: true,
      taskAssignments: true,
      contractSignatures: true,
      teamInvitations: true,
      realtimeCollaboration: true,
      systemAnnouncements: true,
    };
    preferences.dailyDigest = false;
    preferences.weeklyDigest = false;
    preferences.doNotDisturb = false;
    preferences.doNotDisturbStart = null;
    preferences.doNotDisturbEnd = null;
    preferences.mutedProjects = [];
    preferences.mutedUsers = [];

    return this.preferencesRepository.save(preferences);
  }
}

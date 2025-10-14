import { IsBoolean, IsOptional, IsObject, IsString, IsArray, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  emailPreferences?: {
    projectUpdates?: boolean;
    fileComments?: boolean;
    mentions?: boolean;
    taskAssignments?: boolean;
    contractSignatures?: boolean;
    teamInvitations?: boolean;
    analyticsReports?: boolean;
    systemAnnouncements?: boolean;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  pushPreferences?: {
    projectUpdates?: boolean;
    fileComments?: boolean;
    mentions?: boolean;
    taskAssignments?: boolean;
    contractSignatures?: boolean;
    teamInvitations?: boolean;
    realtimeCollaboration?: boolean;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  inAppPreferences?: {
    projectUpdates?: boolean;
    fileComments?: boolean;
    mentions?: boolean;
    taskAssignments?: boolean;
    contractSignatures?: boolean;
    teamInvitations?: boolean;
    realtimeCollaboration?: boolean;
    systemAnnouncements?: boolean;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dailyDigest?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  weeklyDigest?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'digestTime must be in HH:MM format',
  })
  digestTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  doNotDisturb?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'doNotDisturbStart must be in HH:MM format',
  })
  doNotDisturbStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'doNotDisturbEnd must be in HH:MM format',
  })
  doNotDisturbEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mutedProjects?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mutedUsers?: string[];
}

export class MuteProjectDto {
  @IsString()
  projectId: string;
}

export class MuteUserDto {
  @IsString()
  userId: string;
}

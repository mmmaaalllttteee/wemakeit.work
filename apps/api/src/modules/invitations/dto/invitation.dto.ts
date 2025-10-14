import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ['admin', 'member', 'viewer'] })
  @IsEnum(['admin', 'member', 'viewer'])
  role: 'admin' | 'member' | 'viewer';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  permissions?: {
    projects?: string[];
    canCreateProjects?: boolean;
    canInviteUsers?: boolean;
    canManageBilling?: boolean;
    customPermissions?: Record<string, boolean>;
  };
}

export class ResendInvitationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}

export class AcceptInvitationDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string; // For new users
}

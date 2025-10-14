import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShareDto {
  @ApiProperty({ enum: ['project', 'board', 'moodboard', 'file', 'folder'] })
  @IsEnum(['project', 'board', 'moodboard', 'file', 'folder'])
  resourceType: 'project' | 'board' | 'moodboard' | 'file' | 'folder';

  @ApiProperty()
  @IsUUID()
  resourceId: string;

  @ApiProperty({ type: 'object' })
  permissions: {
    canView: boolean;
    canComment: boolean;
    canEdit: boolean;
    canUpload: boolean;
    canDownload: boolean;
    canReshare: boolean;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedEmails?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDomains?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  customization?: {
    title?: string;
    message?: string;
    logo?: string;
    brandColor?: string;
  };
}

export class UpdateShareDto {
  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  permissions?: {
    canView: boolean;
    canComment: boolean;
    canEdit: boolean;
    canUpload: boolean;
    canDownload: boolean;
    canReshare: boolean;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedEmails?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDomains?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  customization?: {
    title?: string;
    message?: string;
    logo?: string;
    brandColor?: string;
  };
}

export class AccessShareDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}

export class ShareResponseDto {
  id: string;
  token: string;
  resourceType: string;
  resourceId: string;
  permissions: any;
  expiresAt?: Date;
  shareUrl: string;
  requiresPassword: boolean;
  requiresEmail: boolean;
  customization?: any;
}

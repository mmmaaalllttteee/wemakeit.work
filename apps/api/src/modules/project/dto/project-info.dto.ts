import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsObject,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectInfoDto {
  @ApiProperty()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  sections?: Array<{
    id: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'gallery' | 'links' | 'credits';
    title?: string;
    content?: any;
    order: number;
  }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: {
    artist?: string;
    releaseDate?: string;
    genre?: string[];
    label?: string;
    credits?: Array<{
      name: string;
      role: string;
    }>;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  socialLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  passwordProtected?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showAnalytics?: boolean;
}

export class UpdateProjectInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  sections?: Array<{
    id: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'gallery' | 'links' | 'credits';
    title?: string;
    content?: any;
    order: number;
  }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: {
    artist?: string;
    releaseDate?: string;
    genre?: string[];
    label?: string;
    credits?: Array<{
      name: string;
      role: string;
    }>;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  socialLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  passwordProtected?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showAnalytics?: boolean;
}

export class VerifyPasswordDto {
  @ApiProperty()
  @IsString()
  password: string;
}

import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['music-release', 'marketing', 'event', 'general', 'custom'] })
  @IsEnum(['music-release', 'marketing', 'event', 'general', 'custom'])
  category: 'music-release' | 'marketing' | 'event' | 'general' | 'custom';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ type: 'array' })
  @IsArray()
  columns: any[];

  @ApiProperty({ type: 'array' })
  @IsArray()
  tasks: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class ApplyTemplateDto {
  @ApiProperty()
  @IsString()
  templateId: string;

  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  boardName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  customizations?: {
    startDate?: Date;
    assignees?: Record<string, string>;
  };
}

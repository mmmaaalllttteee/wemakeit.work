import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateActivityDto {
  @ApiProperty()
  @IsString()
  action: string;

  @ApiProperty()
  @IsString()
  resourceType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resourceName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;
}

export class QueryActivitiesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isImportant?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 50;
}

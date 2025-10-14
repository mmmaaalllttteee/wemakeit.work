import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryAuditLogsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ enum: ['success', 'failure', 'warning'] })
  @IsOptional()
  @IsEnum(['success', 'failure', 'warning'])
  status?: 'success' | 'failure' | 'warning';

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

export class CreateAuditLogDto {
  @IsString()
  action: string;

  @IsString()
  resourceType: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsEnum(['success', 'failure', 'warning'])
  status?: 'success' | 'failure' | 'warning';

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConnectProviderDto {
  @ApiProperty({
    enum: [
      'google_analytics',
      'meta_business',
      'youtube',
      'spotify',
      'apple_music',
      'tiktok',
      'instagram',
    ],
  })
  @IsEnum([
    'google_analytics',
    'meta_business',
    'youtube',
    'spotify',
    'apple_music',
    'tiktok',
    'instagram',
  ])
  provider:
    | 'google_analytics'
    | 'meta_business'
    | 'youtube'
    | 'spotify'
    | 'apple_music'
    | 'tiktok'
    | 'instagram';

  @ApiProperty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  redirectUri?: string;
}

export class UpdateConnectionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ enum: ['active', 'expired', 'revoked', 'error'] })
  @IsOptional()
  @IsEnum(['active', 'expired', 'revoked', 'error'])
  status?: 'active' | 'expired' | 'revoked' | 'error';
}

export class SyncMetricsDto {
  @ApiProperty()
  @IsString()
  connectionId: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricTypes?: string[];
}

export class GetMetricsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  connectionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricTypes?: string[];

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: ['day', 'week', 'month'] })
  @IsOptional()
  @IsEnum(['day', 'week', 'month'])
  granularity?: 'day' | 'week' | 'month';

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  dimensions?: Record<string, any>;
}

export class AggregateMetricsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  metricTypes: string[];

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: ['sum', 'avg', 'min', 'max', 'last'] })
  @IsOptional()
  @IsEnum(['sum', 'avg', 'min', 'max', 'last'])
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'last';
}

export class CreateMetricDto {
  @ApiProperty()
  @IsString()
  connectionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty()
  @IsString()
  metricType: string;

  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  dimensions?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

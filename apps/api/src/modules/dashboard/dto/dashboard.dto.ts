import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Widget DTOs
export class CreateWidgetDto {
  @ApiProperty({ enum: ['kpi', 'note', 'chart', 'shortcut'] })
  @IsEnum(['kpi', 'note', 'chart', 'shortcut'])
  type: 'kpi' | 'note' | 'chart' | 'shortcut';

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsObject()
  config: any;

  @ApiPropertyOptional({ enum: ['small', 'medium', 'large', 'wide'] })
  @IsOptional()
  @IsEnum(['small', 'medium', 'large', 'wide'])
  size?: 'small' | 'medium' | 'large' | 'wide';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;
}

export class UpdateWidgetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  position?: number;

  @ApiPropertyOptional({ enum: ['small', 'medium', 'large', 'wide'] })
  @IsOptional()
  @IsEnum(['small', 'medium', 'large', 'wide'])
  size?: 'small' | 'medium' | 'large' | 'wide';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class ReorderWidgetsDto {
  @ApiProperty({ type: 'object', description: 'Map of widget IDs to positions' })
  @IsObject()
  positions: Record<string, number>;
}

// Note DTOs
export class CreateNoteDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'] })
  @IsOptional()
  @IsEnum(['yellow', 'blue', 'green', 'pink', 'purple', 'orange'])
  color?: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ enum: ['personal', 'organization', 'project'] })
  @IsOptional()
  @IsEnum(['personal', 'organization', 'project'])
  scope?: 'personal' | 'organization' | 'project';
}

export class UpdateNoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'] })
  @IsOptional()
  @IsEnum(['yellow', 'blue', 'green', 'pink', 'purple', 'orange'])
  color?: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  position?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

// Dashboard Stats DTO
export class DashboardStatsDto {
  projects: {
    total: number;
    active: number;
    archived: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
  };
  files: {
    total: number;
    size: number;
  };
  team: {
    members: number;
  };
}

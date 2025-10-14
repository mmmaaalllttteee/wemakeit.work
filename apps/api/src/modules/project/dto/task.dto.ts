import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsNumber,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '@wmiw/types';

export class CreateTaskDto {
  @ApiProperty({ example: 'Design album cover' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Column ID where task will be created' })
  @IsUUID()
  columnId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiProperty({ required: false, example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false, enum: ['low', 'medium', 'high', 'urgent'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: TaskPriority;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];
}

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false, enum: ['low', 'medium', 'high', 'urgent'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: TaskPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];
}

export class MoveTaskDto {
  @ApiProperty({ description: 'Target column ID' })
  @IsUUID()
  columnId: string;

  @ApiProperty({ description: 'Position in new column' })
  @IsNumber()
  position: number;
}

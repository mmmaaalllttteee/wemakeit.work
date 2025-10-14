import { IsString, IsEnum, IsOptional, IsNumber, IsObject, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Moodboard DTOs
export class CreateMoodboardDto {
  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  settings?: {
    backgroundColor?: string;
    gridEnabled?: boolean;
    gridSize?: number;
    snapToGrid?: boolean;
  };
}

export class UpdateMoodboardDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  settings?: any;

  @ApiPropertyOptional({ enum: ['private', 'team', 'public'] })
  @IsOptional()
  @IsEnum(['private', 'team', 'public'])
  visibility?: 'private' | 'team' | 'public';
}

// Mood Item DTOs
export class CreateMoodItemDto {
  @ApiProperty({ enum: ['image', 'video', 'audio', 'file', 'link', 'text', 'shape'] })
  @IsEnum(['image', 'video', 'audio', 'file', 'link', 'text', 'shape'])
  type: 'image' | 'video' | 'audio' | 'file' | 'link' | 'text' | 'shape';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  fileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;

  @ApiProperty()
  @IsNumber()
  width: number;

  @ApiProperty()
  @IsNumber()
  height: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rotation?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  zIndex?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateMoodItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  x?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  y?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rotation?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  zIndex?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  opacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class BulkUpdateItemsDto {
  @ApiProperty({ type: 'object' })
  @IsObject()
  updates: Record<string, Partial<UpdateMoodItemDto>>;
}

export class AddCommentDto {
  @ApiProperty()
  @IsString()
  text: string;
}

export class AddReactionDto {
  @ApiProperty()
  @IsString()
  emoji: string;
}

export class FetchOEmbedDto {
  @ApiProperty()
  @IsString()
  url: string;
}

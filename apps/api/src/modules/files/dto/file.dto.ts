import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  size: number;

  @ApiProperty()
  @IsString()
  mimeType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateFolderDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateFileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class PresignedUploadDto {
  @ApiProperty()
  @IsString()
  fileName: string;

  @ApiProperty()
  @IsString()
  fileType: string;

  @ApiProperty()
  @IsNumber()
  fileSize: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  folderId?: string;
}

export class CompleteUploadDto {
  @ApiProperty()
  @IsString()
  fileId: string;

  @ApiProperty()
  @IsString()
  path: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  checksum?: string;
}

export class MoveFilesDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  fileIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  targetFolderId?: string;
}

export class ShareFileDto {
  @ApiProperty()
  @IsBoolean()
  isPublic: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  expiresAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedEmails?: string[];
}

export class FileQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['active', 'archived', 'deleted'])
  status?: 'active' | 'archived' | 'deleted';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

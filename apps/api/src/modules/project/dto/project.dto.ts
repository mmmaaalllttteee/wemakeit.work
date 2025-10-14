import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '@wmiw/types';

export class CreateProjectDto {
  @ApiProperty({ example: 'Album Release 2025' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ required: false, example: 'Project description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 'album-release-2025' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must only contain lowercase letters, numbers, and hyphens',
  })
  slug?: string;
}

export class UpdateProjectDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, enum: ['active', 'archived', 'completed'] })
  @IsOptional()
  @IsEnum(['active', 'archived', 'completed'])
  status?: ProjectStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  coverImage?: string;
}

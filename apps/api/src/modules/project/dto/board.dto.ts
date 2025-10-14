import { IsString, IsOptional, IsEnum, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BoardVisibility } from '@wmiw/types';

export class CreateBoardDto {
  @ApiProperty({ example: 'Marketing Tasks' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, enum: ['private', 'team', 'public'] })
  @IsOptional()
  @IsEnum(['private', 'team', 'public'])
  visibility?: BoardVisibility;

  @ApiProperty({ required: false, description: 'Template ID to create board from' })
  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class UpdateBoardDto {
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

  @ApiProperty({ required: false, enum: ['private', 'team', 'public'] })
  @IsOptional()
  @IsEnum(['private', 'team', 'public'])
  visibility?: BoardVisibility;
}

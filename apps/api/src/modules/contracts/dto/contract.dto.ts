import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsBoolean,
  IsNumber,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== Contract Template DTOs ====================

class TemplateVariableDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty({ enum: ['text', 'number', 'date', 'email', 'currency', 'select'] })
  @IsEnum(['text', 'number', 'date', 'email', 'currency', 'select'])
  type: 'text' | 'number' | 'date' | 'email' | 'currency' | 'select';

  @ApiProperty()
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  defaultValue?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  helpText?: string;
}

class TemplateSectionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNumber()
  order: number;

  @ApiProperty()
  @IsBoolean()
  optional: boolean;
}

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({
    enum: [
      'recording',
      'publishing',
      'licensing',
      'management',
      'distribution',
      'collaboration',
      'other',
    ],
  })
  @IsEnum([
    'recording',
    'publishing',
    'licensing',
    'management',
    'distribution',
    'collaboration',
    'other',
  ])
  category:
    | 'recording'
    | 'publishing'
    | 'licensing'
    | 'management'
    | 'distribution'
    | 'collaboration'
    | 'other';

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ type: [TemplateVariableDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariableDto)
  variables: TemplateVariableDto[];

  @ApiPropertyOptional({ type: [TemplateSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateSectionDto)
  sections?: TemplateSectionDto[];

  @ApiPropertyOptional({ enum: ['organization', 'public', 'private'] })
  @IsOptional()
  @IsEnum(['organization', 'public', 'private'])
  visibility?: 'organization' | 'public' | 'private';

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateTemplateDto {
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
  @IsString()
  content?: string;

  @ApiPropertyOptional({ type: [TemplateVariableDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariableDto)
  variables?: TemplateVariableDto[];

  @ApiPropertyOptional({ type: [TemplateSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateSectionDto)
  sections?: TemplateSectionDto[];

  @ApiPropertyOptional({ enum: ['draft', 'active', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'active', 'archived'])
  status?: 'draft' | 'active' | 'archived';

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// ==================== Contract DTOs ====================

class ContractPartyDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  role: string;
}

export class CreateContractDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string; // Optional if using template

  @ApiProperty()
  @IsObject()
  variables: Record<string, any>;

  @ApiProperty({ type: [ContractPartyDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractPartyDto)
  parties: ContractPartyDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateContractDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional({
    enum: [
      'draft',
      'pending_review',
      'pending_signatures',
      'signed',
      'active',
      'expired',
      'terminated',
    ],
  })
  @IsOptional()
  @IsEnum([
    'draft',
    'pending_review',
    'pending_signatures',
    'signed',
    'active',
    'expired',
    'terminated',
  ])
  status?:
    | 'draft'
    | 'pending_review'
    | 'pending_signatures'
    | 'signed'
    | 'active'
    | 'expired'
    | 'terminated';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SignContractDto {
  @ApiProperty()
  @IsString()
  partyId: string;

  @ApiProperty()
  @IsString()
  signatureData: string; // Base64 image or signature token

  @ApiProperty({ enum: ['drawn', 'typed', 'uploaded', 'electronic'] })
  @IsEnum(['drawn', 'typed', 'uploaded', 'electronic'])
  method: 'drawn' | 'typed' | 'uploaded' | 'electronic';
}

export class SendForSignatureDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  partyIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sendReminders?: boolean;
}

export class GeneratePdfDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeSignatures?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  watermark?: boolean;
}

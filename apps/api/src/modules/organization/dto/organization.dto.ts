import { IsString, IsOptional, IsUrl, IsHexColor, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({ required: false, example: '#6366F1' })
  @IsOptional()
  @IsHexColor()
  accentColor?: string;
}

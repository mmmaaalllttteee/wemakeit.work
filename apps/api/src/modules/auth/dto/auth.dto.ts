import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, maxLength: 100 })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'My Label' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  organizationName: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ required: false, example: '123456' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  twofaCode?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ minLength: 8, maxLength: 100 })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

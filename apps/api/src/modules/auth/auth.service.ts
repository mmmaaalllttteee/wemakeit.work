import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { Organization } from '../organization/entities/organization.entity';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create organization
    const slug = this.generateSlug(registerDto.organizationName);
    const organization = this.organizationRepository.create({
      name: registerDto.organizationName,
      slug,
      billingPlan: 'free',
      seatsMax: 1,
      seatsUsed: 1,
    });

    await this.organizationRepository.save(organization);

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      name: registerDto.name,
      orgId: organization.id,
      role: 'owner',
      status: 'active',
      preferences: {
        themeMode: 'auto',
        locale: 'en',
        emailNotifications: true,
        desktopNotifications: true,
      },
    });

    await this.userRepository.save(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['organization'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check 2FA if enabled
    if (user.twofaEnabled) {
      if (!loginDto.twofaCode) {
        return { requiresTwoFa: true };
      }
      // TODO: Verify 2FA code with speakeasy
      // For now, we'll skip 2FA verification in MVP
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await this.userRepository.save(user);

    // TODO: Send email with reset link
    // For now, just return token in dev mode
    if (this.configService.get('NODE_ENV') === 'development') {
      return { resetToken, message: 'Reset token generated (dev mode)' };
    }

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { resetToken: resetPasswordDto.token },
    });

    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(resetPasswordDto.password, 10);

    user.passwordHash = passwordHash;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successful' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['organization'],
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      orgId: user.orgId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, resetToken, resetTokenExpires, twofaSecret, ...sanitized } = user;
    return sanitized;
  }

  private generateSlug(name: string): string {
    return (
      `${name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100) 
      }-${ 
      Math.random().toString(36).substring(7)}`
    );
  }
}

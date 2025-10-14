import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Share } from './entities/share.entity';
import { CreateShareDto, UpdateShareDto, AccessShareDto, ShareResponseDto } from './dto/share.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(Share)
    private shareRepository: Repository<Share>,
    private configService: ConfigService,
  ) {}

  /**
   * Create a new share link
   */
  async createShare(dto: CreateShareDto, userId: string, orgId: string): Promise<ShareResponseDto> {
    // Generate unique token
    const token = this.generateToken();

    // Hash password if provided
    let passwordHash: string | null = null;
    if (dto.password) {
      passwordHash = crypto.createHash('sha256').update(dto.password).digest('hex');
    }

    const share = this.shareRepository.create({
      token,
      orgId,
      resourceType: dto.resourceType,
      resourceId: dto.resourceId,
      createdBy: userId,
      permissions: dto.permissions,
      passwordHash,
      expiresAt: dto.expiresAt,
      allowedEmails: dto.allowedEmails,
      allowedDomains: dto.allowedDomains,
      customization: dto.customization,
      isActive: true,
      accessCount: 0,
      accessLog: [],
    });

    const savedShare = await this.shareRepository.save(share);

    return this.toResponseDto(savedShare);
  }

  /**
   * Get share by ID (for owner)
   */
  async getShare(id: string, userId: string, orgId: string): Promise<Share> {
    const share = await this.shareRepository.findOne({
      where: { id, orgId },
      relations: ['creator'],
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.createdBy !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return share;
  }

  /**
   * Update share settings
   */
  async updateShare(
    id: string,
    dto: UpdateShareDto,
    userId: string,
    orgId: string,
  ): Promise<ShareResponseDto> {
    const share = await this.getShare(id, userId, orgId);

    if (dto.permissions) {share.permissions = dto.permissions;}
    if (dto.password !== undefined) {
      share.passwordHash = dto.password
        ? crypto.createHash('sha256').update(dto.password).digest('hex')
        : null;
    }
    if (dto.expiresAt !== undefined) {share.expiresAt = dto.expiresAt;}
    if (dto.allowedEmails !== undefined) {share.allowedEmails = dto.allowedEmails;}
    if (dto.allowedDomains !== undefined) {share.allowedDomains = dto.allowedDomains;}
    if (dto.isActive !== undefined) {share.isActive = dto.isActive;}
    if (dto.customization) {share.customization = { ...share.customization, ...dto.customization };}

    const updatedShare = await this.shareRepository.save(share);

    return this.toResponseDto(updatedShare);
  }

  /**
   * Delete share
   */
  async deleteShare(id: string, userId: string, orgId: string): Promise<void> {
    const share = await this.getShare(id, userId, orgId);
    await this.shareRepository.remove(share);
  }

  /**
   * List shares for a resource
   */
  async listSharesForResource(
    resourceType: string,
    resourceId: string,
    userId: string,
    orgId: string,
  ): Promise<ShareResponseDto[]> {
    const shares = await this.shareRepository.find({
      where: {
        orgId,
        resourceType: resourceType as any,
        resourceId,
      },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });

    return shares.map((share) => this.toResponseDto(share));
  }

  /**
   * Access share (public endpoint)
   */
  async accessShare(dto: AccessShareDto, ip?: string, userAgent?: string): Promise<any> {
    const share = await this.shareRepository.findOne({
      where: { token: dto.token },
      relations: ['organization'],
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Check if active
    if (!share.isActive) {
      throw new ForbiddenException('This share link has been deactivated');
    }

    // Check expiry
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      throw new ForbiddenException('This share link has expired');
    }

    // Check password
    if (share.passwordHash) {
      if (!dto.password) {
        throw new ForbiddenException('Password required');
      }

      const providedPasswordHash = crypto.createHash('sha256').update(dto.password).digest('hex');

      if (providedPasswordHash !== share.passwordHash) {
        throw new ForbiddenException('Invalid password');
      }
    }

    // Check email allowlist
    if (share.allowedEmails && share.allowedEmails.length > 0) {
      if (!dto.email) {
        throw new ForbiddenException('Email required');
      }

      if (!share.allowedEmails.includes(dto.email)) {
        throw new ForbiddenException('Email not authorized');
      }
    }

    // Check domain allowlist
    if (share.allowedDomains && share.allowedDomains.length > 0 && dto.email) {
      const emailDomain = dto.email.split('@')[1];
      if (!share.allowedDomains.includes(emailDomain)) {
        throw new ForbiddenException('Email domain not authorized');
      }
    }

    // Log access
    const accessEntry = {
      timestamp: new Date(),
      ip,
      userAgent,
      email: dto.email,
    };

    share.accessCount += 1;
    share.lastAccessedAt = new Date();
    share.accessLog = [...(share.accessLog || []), accessEntry];

    // Keep only last 100 access log entries
    if (share.accessLog.length > 100) {
      share.accessLog = share.accessLog.slice(-100);
    }

    await this.shareRepository.save(share);

    // Return share info and resource data
    return {
      share: {
        id: share.id,
        resourceType: share.resourceType,
        resourceId: share.resourceId,
        permissions: share.permissions,
        customization: share.customization,
        organization: {
          name: share.organization.name,
          logo: share.organization.settings?.logo,
        },
      },
      requiresPassword: !!share.passwordHash,
      requiresEmail: !!(share.allowedEmails && share.allowedEmails.length > 0),
    };
  }

  /**
   * Verify share access (for middleware)
   */
  async verifyShareAccess(
    token: string,
    password?: string,
    email?: string,
  ): Promise<{ share: Share; granted: boolean }> {
    try {
      const share = await this.shareRepository.findOne({ where: { token } });

      if (!share || !share.isActive) {
        return { share: null, granted: false };
      }

      if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
        return { share: null, granted: false };
      }

      if (share.passwordHash && password) {
        const providedPasswordHash = crypto.createHash('sha256').update(password).digest('hex');
        if (providedPasswordHash !== share.passwordHash) {
          return { share, granted: false };
        }
      }

      if (share.allowedEmails && share.allowedEmails.length > 0 && email) {
        if (!share.allowedEmails.includes(email)) {
          return { share, granted: false };
        }
      }

      return { share, granted: true };
    } catch (error) {
      return { share: null, granted: false };
    }
  }

  /**
   * Generate unique token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Convert Share entity to response DTO
   */
  private toResponseDto(share: Share): ShareResponseDto {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    return {
      id: share.id,
      token: share.token,
      resourceType: share.resourceType,
      resourceId: share.resourceId,
      permissions: share.permissions,
      expiresAt: share.expiresAt,
      shareUrl: `${frontendUrl}/shared/${share.token}`,
      requiresPassword: !!share.passwordHash,
      requiresEmail: !!(share.allowedEmails && share.allowedEmails.length > 0),
      customization: share.customization,
    };
  }

  /**
   * Get analytics for share
   */
  async getShareAnalytics(id: string, userId: string, orgId: string): Promise<any> {
    const share = await this.getShare(id, userId, orgId);

    return {
      accessCount: share.accessCount,
      lastAccessedAt: share.lastAccessedAt,
      recentAccess: share.accessLog?.slice(-10) || [],
      uniqueEmails: [...new Set((share.accessLog || []).map((log) => log.email).filter(Boolean))],
    };
  }
}

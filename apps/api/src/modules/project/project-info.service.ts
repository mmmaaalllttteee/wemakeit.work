import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectInfoPage } from './entities/project-info.entity';
import {
  CreateProjectInfoDto,
  UpdateProjectInfoDto,
  VerifyPasswordDto,
} from './dto/project-info.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProjectInfoService {
  constructor(
    @InjectRepository(ProjectInfoPage)
    private projectInfoRepository: Repository<ProjectInfoPage>,
  ) {}

  /**
   * Create a project info page
   */
  async create(
    projectId: string,
    orgId: string,
    dto: CreateProjectInfoDto,
  ): Promise<ProjectInfoPage> {
    // Check if info page already exists for this project
    const existing = await this.projectInfoRepository.findOne({
      where: { projectId },
    });

    if (existing) {
      throw new ConflictException('Info page already exists for this project');
    }

    // Check if slug is already taken
    const slugExists = await this.projectInfoRepository.findOne({
      where: { slug: dto.slug },
    });

    if (slugExists) {
      throw new ConflictException('Slug is already taken');
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (dto.passwordProtected && dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const infoPage = this.projectInfoRepository.create({
      projectId,
      ...dto,
      password: hashedPassword,
      analytics: {
        views: 0,
        uniqueVisitors: 0,
      },
    });

    return this.projectInfoRepository.save(infoPage);
  }

  /**
   * Get project info page by project ID
   */
  async getByProjectId(projectId: string, orgId: string): Promise<ProjectInfoPage> {
    const infoPage = await this.projectInfoRepository.findOne({
      where: { projectId },
      relations: ['project'],
    });

    if (!infoPage) {
      throw new NotFoundException('Info page not found');
    }

    // Verify the project belongs to the organization
    if (infoPage.project.orgId !== orgId) {
      throw new NotFoundException('Info page not found');
    }

    return infoPage;
  }

  /**
   * Get project info page by slug (public access)
   */
  async getBySlug(slug: string, password?: string): Promise<ProjectInfoPage> {
    const infoPage = await this.projectInfoRepository.findOne({
      where: { slug },
      relations: ['project'],
    });

    if (!infoPage) {
      throw new NotFoundException('Info page not found');
    }

    if (!infoPage.isPublic) {
      throw new NotFoundException('Info page not found');
    }

    // Check password protection
    if (infoPage.passwordProtected) {
      if (!password) {
        throw new BadRequestException('Password required');
      }

      const isValid = await bcrypt.compare(password, infoPage.password);
      if (!isValid) {
        throw new BadRequestException('Invalid password');
      }
    }

    // Track view
    await this.trackView(infoPage.id);

    return infoPage;
  }

  /**
   * Update project info page
   */
  async update(
    projectId: string,
    orgId: string,
    dto: UpdateProjectInfoDto,
  ): Promise<ProjectInfoPage> {
    const infoPage = await this.getByProjectId(projectId, orgId);

    // Check slug uniqueness if changed
    if (dto.slug && dto.slug !== infoPage.slug) {
      const slugExists = await this.projectInfoRepository.findOne({
        where: { slug: dto.slug },
      });

      if (slugExists) {
        throw new ConflictException('Slug is already taken');
      }
    }

    // Hash new password if provided
    if (dto.passwordProtected && dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(infoPage, dto);

    return this.projectInfoRepository.save(infoPage);
  }

  /**
   * Publish/unpublish project info page
   */
  async publish(projectId: string, orgId: string, isPublic: boolean): Promise<ProjectInfoPage> {
    const infoPage = await this.getByProjectId(projectId, orgId);

    infoPage.isPublic = isPublic;
    if (isPublic && !infoPage.publishedAt) {
      infoPage.publishedAt = new Date();
    }

    return this.projectInfoRepository.save(infoPage);
  }

  /**
   * Delete project info page
   */
  async delete(projectId: string, orgId: string): Promise<void> {
    const infoPage = await this.getByProjectId(projectId, orgId);
    await this.projectInfoRepository.remove(infoPage);
  }

  /**
   * Track a view
   */
  async trackView(id: string): Promise<void> {
    await this.projectInfoRepository
      .createQueryBuilder()
      .update(ProjectInfoPage)
      .set({
        analytics: () =>
          "jsonb_set(analytics, '{views}', (COALESCE(analytics->>'views', '0')::int + 1)::text::jsonb)",
      })
      .where('id = :id', { id })
      .execute();
  }

  /**
   * Get analytics for project info page
   */
  async getAnalytics(projectId: string, orgId: string): Promise<any> {
    const infoPage = await this.getByProjectId(projectId, orgId);

    return {
      views: infoPage.analytics?.views || 0,
      uniqueVisitors: infoPage.analytics?.uniqueVisitors || 0,
      lastViewed: infoPage.analytics?.lastViewed,
      publishedAt: infoPage.publishedAt,
      isPublic: infoPage.isPublic,
    };
  }

  /**
   * Verify password for protected page
   */
  async verifyPassword(slug: string, password: string): Promise<boolean> {
    const infoPage = await this.projectInfoRepository.findOne({
      where: { slug },
    });

    if (!infoPage || !infoPage.passwordProtected) {
      return false;
    }

    return bcrypt.compare(password, infoPage.password);
  }

  /**
   * Check slug availability
   */
  async checkSlugAvailability(slug: string): Promise<boolean> {
    const exists = await this.projectInfoRepository.findOne({
      where: { slug },
    });

    return !exists;
  }
}

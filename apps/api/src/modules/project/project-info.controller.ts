import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectInfoService } from './project-info.service';
import {
  CreateProjectInfoDto,
  UpdateProjectInfoDto,
  VerifyPasswordDto,
} from './dto/project-info.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('project-info')
@Controller('project-info')
export class ProjectInfoController {
  constructor(private readonly projectInfoService: ProjectInfoService) {}

  @Post('projects/:projectId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create project info page' })
  async create(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectInfoDto,
  ) {
    return this.projectInfoService.create(projectId, req.user.orgId, dto);
  }

  @Get('projects/:projectId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get project info page by project ID' })
  async getByProjectId(@Req() req: any, @Param('projectId') projectId: string) {
    return this.projectInfoService.getByProjectId(projectId, req.user.orgId);
  }

  @Put('projects/:projectId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update project info page' })
  async update(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectInfoDto,
  ) {
    return this.projectInfoService.update(projectId, req.user.orgId, dto);
  }

  @Delete('projects/:projectId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete project info page' })
  async delete(@Req() req: any, @Param('projectId') projectId: string) {
    await this.projectInfoService.delete(projectId, req.user.orgId);
  }

  @Put('projects/:projectId/publish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Publish/unpublish project info page' })
  async publish(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body('isPublic') isPublic: boolean,
  ) {
    return this.projectInfoService.publish(projectId, req.user.orgId, isPublic);
  }

  @Get('projects/:projectId/analytics')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get project info page analytics' })
  async getAnalytics(@Req() req: any, @Param('projectId') projectId: string) {
    return this.projectInfoService.getAnalytics(projectId, req.user.orgId);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get project info page by slug (public)' })
  async getBySlug(@Param('slug') slug: string, @Query('password') password?: string) {
    return this.projectInfoService.getBySlug(slug, password);
  }

  @Post('slug/:slug/verify-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify password for protected page' })
  async verifyPassword(@Param('slug') slug: string, @Body() dto: VerifyPasswordDto) {
    const isValid = await this.projectInfoService.verifyPassword(slug, dto.password);
    return { valid: isValid };
  }

  @Get('check-slug/:slug')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check slug availability' })
  async checkSlugAvailability(@Param('slug') slug: string) {
    const available = await this.projectInfoService.checkSlugAvailability(slug);
    return { available };
  }
}

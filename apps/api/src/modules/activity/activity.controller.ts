import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { CreateActivityDto, QueryActivitiesDto } from './dto/activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create activity entry' })
  async create(@Req() req: any, @Body() dto: CreateActivityDto) {
    const { orgId, sub: userId, email: userName, avatar } = req.user;

    return this.activityService.create(orgId, userId, userName, avatar, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Query activities' })
  async query(@Req() req: any, @Query() dto: QueryActivitiesDto) {
    return this.activityService.query(req.user.orgId, dto);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent activities' })
  async getRecent(@Req() req: any, @Query('limit') limit?: number) {
    return this.activityService.getRecent(req.user.orgId, limit);
  }

  @Get('important')
  @ApiOperation({ summary: 'Get important activities' })
  async getImportant(@Req() req: any, @Query('limit') limit?: number) {
    return this.activityService.getImportantActivities(req.user.orgId, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get activity statistics' })
  async getStats(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.activityService.getStats(
      req.user.orgId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get activity timeline' })
  async getTimeline(@Req() req: any, @Query('days') days?: number) {
    return this.activityService.getTimeline(req.user.orgId, days);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get activities for a specific project' })
  async getProjectActivities(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Query('limit') limit?: number,
  ) {
    return this.activityService.getProjectActivities(req.user.orgId, projectId, limit);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get activities by a specific user' })
  async getUserActivities(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.activityService.getUserActivities(req.user.orgId, userId, limit);
  }
}

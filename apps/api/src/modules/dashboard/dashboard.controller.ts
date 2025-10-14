import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../auth/decorators/auth.decorators';
import { User } from '../auth/entities/user.entity';
import {
  CreateWidgetDto,
  UpdateWidgetDto,
  ReorderWidgetsDto,
  CreateNoteDto,
  UpdateNoteDto,
} from './dto/dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ==================== Stats ====================

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStats(@CurrentUser() user: User) {
    return await this.dashboardService.getDashboardStats(user.orgId);
  }

  // ==================== Widgets ====================

  @Post('widgets')
  @ApiOperation({ summary: 'Create widget' })
  @ApiResponse({ status: 201, description: 'Widget created' })
  async createWidget(@Body() dto: CreateWidgetDto, @CurrentUser() user: User) {
    return await this.dashboardService.createWidget(dto, user.id, user.orgId);
  }

  @Get('widgets')
  @ApiOperation({ summary: 'Get user widgets' })
  @ApiResponse({ status: 200, description: 'Widgets retrieved' })
  async getWidgets(@Query('projectId') projectId: string, @CurrentUser() user: User) {
    return await this.dashboardService.getWidgets(user.id, projectId);
  }

  @Patch('widgets/:id')
  @ApiOperation({ summary: 'Update widget' })
  @ApiResponse({ status: 200, description: 'Widget updated' })
  async updateWidget(
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
    @CurrentUser() user: User,
  ) {
    return await this.dashboardService.updateWidget(id, dto, user.id);
  }

  @Delete('widgets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete widget' })
  @ApiResponse({ status: 204, description: 'Widget deleted' })
  async deleteWidget(@Param('id') id: string, @CurrentUser() user: User) {
    await this.dashboardService.deleteWidget(id, user.id);
  }

  @Post('widgets/reorder')
  @ApiOperation({ summary: 'Reorder widgets' })
  @ApiResponse({ status: 200, description: 'Widgets reordered' })
  async reorderWidgets(@Body() dto: ReorderWidgetsDto, @CurrentUser() user: User) {
    await this.dashboardService.reorderWidgets(dto, user.id);
    return { message: 'Widgets reordered successfully' };
  }

  // ==================== Notes ====================

  @Post('notes')
  @ApiOperation({ summary: 'Create note (Post-it)' })
  @ApiResponse({ status: 201, description: 'Note created' })
  async createNote(@Body() dto: CreateNoteDto, @CurrentUser() user: User) {
    return await this.dashboardService.createNote(dto, user.id, user.orgId);
  }

  @Get('notes')
  @ApiOperation({ summary: 'Get notes' })
  @ApiResponse({ status: 200, description: 'Notes retrieved' })
  async getNotes(
    @Query('scope') scope: 'personal' | 'organization' | 'project',
    @Query('projectId') projectId: string,
    @CurrentUser() user: User,
  ) {
    return await this.dashboardService.getNotes(user.id, user.orgId, scope, projectId);
  }

  @Patch('notes/:id')
  @ApiOperation({ summary: 'Update note' })
  @ApiResponse({ status: 200, description: 'Note updated' })
  async updateNote(@Param('id') id: string, @Body() dto: UpdateNoteDto, @CurrentUser() user: User) {
    return await this.dashboardService.updateNote(id, dto, user.id, user.orgId);
  }

  @Delete('notes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete note' })
  @ApiResponse({ status: 204, description: 'Note deleted' })
  async deleteNote(@Param('id') id: string, @CurrentUser() user: User) {
    await this.dashboardService.deleteNote(id, user.id, user.orgId);
  }
}

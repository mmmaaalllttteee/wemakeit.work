import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationPreferencesService } from './notification-preferences.service';
import {
  UpdateNotificationPreferencesDto,
  MuteProjectDto,
  MuteUserDto,
} from './dto/notification-preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notification-preferences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notification-preferences')
export class NotificationPreferencesController {
  constructor(private readonly preferencesService: NotificationPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get notification preferences' })
  async getPreferences(@Req() req: any) {
    return this.preferencesService.getOrCreate(req.user.sub, req.user.orgId);
  }

  @Put()
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(@Req() req: any, @Body() dto: UpdateNotificationPreferencesDto) {
    return this.preferencesService.update(req.user.sub, dto);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset preferences to defaults' })
  async resetToDefaults(@Req() req: any) {
    return this.preferencesService.resetToDefaults(req.user.sub);
  }

  @Post('mute/project')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mute notifications for a project' })
  async muteProject(@Req() req: any, @Body() dto: MuteProjectDto) {
    return this.preferencesService.muteProject(req.user.sub, dto.projectId);
  }

  @Delete('mute/project/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unmute notifications for a project' })
  async unmuteProject(@Req() req: any, @Param('projectId') projectId: string) {
    return this.preferencesService.unmuteProject(req.user.sub, projectId);
  }

  @Post('mute/user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mute notifications from a user' })
  async muteUser(@Req() req: any, @Body() dto: MuteUserDto) {
    return this.preferencesService.muteUser(req.user.sub, dto.userId);
  }

  @Delete('mute/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unmute notifications from a user' })
  async unmuteUser(@Req() req: any, @Param('userId') userId: string) {
    return this.preferencesService.unmuteUser(req.user.sub, userId);
  }
}

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
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SharesService } from './shares.service';
import { CurrentUser, Public } from '../auth/decorators/auth.decorators';
import { User } from '../auth/entities/user.entity';
import { CreateShareDto, UpdateShareDto, AccessShareDto } from './dto/share.dto';

@ApiTags('Shares')
@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create share link' })
  @ApiResponse({ status: 201, description: 'Share created' })
  async createShare(@Body() dto: CreateShareDto, @CurrentUser() user: User) {
    return await this.sharesService.createShare(dto, user.id, user.orgId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get share details' })
  @ApiResponse({ status: 200, description: 'Share retrieved' })
  async getShare(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.sharesService.getShare(id, user.id, user.orgId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update share settings' })
  @ApiResponse({ status: 200, description: 'Share updated' })
  async updateShare(
    @Param('id') id: string,
    @Body() dto: UpdateShareDto,
    @CurrentUser() user: User,
  ) {
    return await this.sharesService.updateShare(id, dto, user.id, user.orgId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete share' })
  @ApiResponse({ status: 204, description: 'Share deleted' })
  async deleteShare(@Param('id') id: string, @CurrentUser() user: User) {
    await this.sharesService.deleteShare(id, user.id, user.orgId);
  }

  @Get('resource/:resourceType/:resourceId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List shares for resource' })
  @ApiResponse({ status: 200, description: 'Shares retrieved' })
  async listShares(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @CurrentUser() user: User,
  ) {
    return await this.sharesService.listSharesForResource(
      resourceType,
      resourceId,
      user.id,
      user.orgId,
    );
  }

  @Get(':id/analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get share analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved' })
  async getAnalytics(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.sharesService.getShareAnalytics(id, user.id, user.orgId);
  }

  @Post('access')
  @Public()
  @ApiOperation({ summary: 'Access shared resource (public)' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  async accessShare(
    @Body() dto: AccessShareDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return await this.sharesService.accessShare(dto, ip, userAgent);
  }
}

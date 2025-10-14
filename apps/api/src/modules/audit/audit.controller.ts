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
import { AuditService } from './audit.service';
import { CreateAuditLogDto, QueryAuditLogsDto } from './dto/audit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create audit log entry' })
  async createLog(@Req() req: any, @Body() dto: CreateAuditLogDto) {
    const { orgId, sub: userId, email: userName } = req.user;

    // Extract IP and user agent from request
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    return this.auditService.log(orgId, userId, userName, {
      ...dto,
      ipAddress: dto.ipAddress || ipAddress,
      userAgent: dto.userAgent || userAgent,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Query audit logs' })
  async queryLogs(@Req() req: any, @Query() dto: QueryAuditLogsDto) {
    return this.auditService.queryLogs(req.user.orgId, dto);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export audit logs to CSV' })
  async exportLogs(@Req() req: any, @Query() dto: QueryAuditLogsDto) {
    const csv = await this.auditService.exportLogs(req.user.orgId, dto);
    return { csv };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit log statistics' })
  async getStats(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getStats(
      req.user.orgId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('resource/:resourceType/:resourceId')
  @ApiOperation({ summary: 'Get audit logs for a specific resource' })
  async getResourceLogs(
    @Req() req: any,
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.auditService.getResourceLogs(req.user.orgId, resourceType, resourceId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  async getUserLogs(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getUserLogs(req.user.orgId, userId, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  async getLog(@Req() req: any, @Param('id') id: string) {
    return this.auditService.getLog(id, req.user.orgId);
  }
}

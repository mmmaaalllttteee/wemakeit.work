import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvitationsService } from './invitations.service';
import {
  CreateInvitationDto,
  AcceptInvitationDto,
  ResendInvitationDto,
} from './dto/invitation.dto';

@ApiTags('Invitations')
@ApiBearerAuth()
@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invitation' })
  async createInvitation(@Body() dto: CreateInvitationDto, @Request() req) {
    return this.invitationsService.createInvitation(dto, req.user.userId, req.user.orgId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invitations for organization' })
  async getInvitations(@Query('status') status: string, @Request() req) {
    return this.invitationsService.getInvitations(req.user.orgId, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get invitation statistics' })
  async getInvitationStats(@Request() req) {
    return this.invitationsService.getInvitationStats(req.user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invitation by ID' })
  async getInvitation(@Param('id') id: string, @Request() req) {
    return this.invitationsService.getInvitation(id, req.user.orgId);
  }

  @Post(':id/resend')
  @ApiOperation({ summary: 'Resend invitation email' })
  async resendInvitation(
    @Param('id') id: string,
    @Body() dto: ResendInvitationDto,
    @Request() req,
  ) {
    return this.invitationsService.resendInvitation(id, dto, req.user.orgId);
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke invitation' })
  async revokeInvitation(@Param('id') id: string, @Request() req) {
    return this.invitationsService.revokeInvitation(id, req.user.orgId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invitation' })
  async deleteInvitation(@Param('id') id: string, @Request() req) {
    await this.invitationsService.deleteInvitation(id, req.user.orgId);
    return { message: 'Invitation deleted successfully' };
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept invitation' })
  async acceptInvitation(@Body() dto: AcceptInvitationDto, @Request() req) {
    return this.invitationsService.acceptInvitation(dto, req.user.userId);
  }

  @Get('token/:token')
  @ApiOperation({ summary: 'Get invitation by token (public)' })
  async getInvitationByToken(@Param('token') token: string) {
    return this.invitationsService.getInvitationByToken(token);
  }
}

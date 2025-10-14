import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CurrentUser } from '../auth/decorators/auth.decorators';
import { User } from '../auth/entities/user.entity';
import { UpdateOrganizationDto } from './dto/organization.dto';

@ApiTags('Organization')
@ApiBearerAuth()
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'Get current organization' })
  @ApiResponse({ status: 200, description: 'Organization retrieved' })
  async getOrganization(@CurrentUser() user: User) {
    return this.organizationService.getOrganization(user);
  }

  @Patch()
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateOrganization(@Body() updateDto: UpdateOrganizationDto, @CurrentUser() user: User) {
    return this.organizationService.updateOrganization(updateDto, user);
  }

  @Get('members')
  @ApiOperation({ summary: 'Get organization members' })
  @ApiResponse({ status: 200, description: 'Members retrieved' })
  async getMembers(@CurrentUser() user: User) {
    return this.organizationService.getMembers(user);
  }
}

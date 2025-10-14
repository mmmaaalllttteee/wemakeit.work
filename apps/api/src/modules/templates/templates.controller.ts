import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CurrentUser } from '../auth/decorators/auth.decorators';
import { User } from '../auth/entities/user.entity';
import { CreateBoardTemplateDto, ApplyTemplateDto } from './dto/template.dto';

@ApiTags('Templates')
@ApiBearerAuth()
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get('boards')
  @ApiOperation({ summary: 'Get board templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved' })
  async getBoardTemplates(@Query('category') category: string, @CurrentUser() user: User) {
    return await this.templatesService.getTemplates(user.id, user.orgId, category);
  }

  @Get('boards/:id')
  @ApiOperation({ summary: 'Get single board template' })
  @ApiResponse({ status: 200, description: 'Template retrieved' })
  async getBoardTemplate(@Param('id') id: string) {
    return await this.templatesService.getTemplate(id);
  }

  @Post('boards')
  @ApiOperation({ summary: 'Create custom board template' })
  @ApiResponse({ status: 201, description: 'Template created' })
  async createBoardTemplate(@Body() dto: CreateBoardTemplateDto, @CurrentUser() user: User) {
    return await this.templatesService.createTemplate(dto, user.id, user.orgId);
  }

  @Post('boards/apply')
  @ApiOperation({ summary: 'Apply template to project' })
  @ApiResponse({ status: 201, description: 'Template applied, board created' })
  async applyBoardTemplate(@Body() dto: ApplyTemplateDto, @CurrentUser() user: User) {
    return await this.templatesService.applyTemplate(dto, user.id);
  }

  @Delete('boards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete custom template' })
  @ApiResponse({ status: 204, description: 'Template deleted' })
  async deleteBoardTemplate(@Param('id') id: string, @CurrentUser() user: User) {
    await this.templatesService.deleteTemplate(id, user.id, user.orgId);
  }
}

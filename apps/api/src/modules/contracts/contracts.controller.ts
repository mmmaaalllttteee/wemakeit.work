import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContractsService } from './contracts.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateContractDto,
  UpdateContractDto,
  SignContractDto,
  SendForSignatureDto,
  GeneratePdfDto,
} from './dto/contract.dto';

@ApiTags('Contracts')
@ApiBearerAuth()
@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  // ==================== Templates ====================

  @Post('templates')
  @ApiOperation({ summary: 'Create a new contract template' })
  async createTemplate(@Body() dto: CreateTemplateDto, @Request() req) {
    return this.contractsService.createTemplate(dto, req.user.userId, req.user.orgId);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all templates' })
  async getTemplates(
    @Query('category') category: string,
    @Query('official') official: string,
    @Request() req,
  ) {
    if (official === 'true') {
      return this.contractsService.getOfficialTemplates(category);
    }
    return this.contractsService.getTemplates(req.user.orgId, category);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a specific template' })
  async getTemplate(@Param('id') id: string, @Request() req) {
    return this.contractsService.getTemplate(id, req.user.orgId);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update template (creates new version)' })
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto, @Request() req) {
    return this.contractsService.updateTemplate(id, dto, req.user.userId, req.user.orgId);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete template' })
  async deleteTemplate(@Param('id') id: string, @Request() req) {
    await this.contractsService.deleteTemplate(id, req.user.orgId);
    return { message: 'Template deleted successfully' };
  }

  // ==================== Contracts ====================

  @Post()
  @ApiOperation({ summary: 'Create a new contract' })
  async createContract(@Body() dto: CreateContractDto, @Request() req) {
    return this.contractsService.createContract(dto, req.user.userId, req.user.orgId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contracts' })
  async getContracts(
    @Query('projectId') projectId: string,
    @Query('status') status: string,
    @Request() req,
  ) {
    return this.contractsService.getContracts(req.user.orgId, projectId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific contract' })
  async getContract(@Param('id') id: string, @Request() req) {
    return this.contractsService.getContract(id, req.user.orgId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contract' })
  async updateContract(@Param('id') id: string, @Body() dto: UpdateContractDto, @Request() req) {
    return this.contractsService.updateContract(id, dto, req.user.userId, req.user.orgId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contract' })
  async deleteContract(@Param('id') id: string, @Request() req) {
    await this.contractsService.deleteContract(id, req.user.orgId);
    return { message: 'Contract deleted successfully' };
  }

  // ==================== Signing & PDF ====================

  @Post(':id/send-for-signature')
  @ApiOperation({ summary: 'Send contract for signature' })
  async sendForSignature(
    @Param('id') id: string,
    @Body() dto: SendForSignatureDto,
    @Request() req,
  ) {
    return this.contractsService.sendForSignature(id, dto, req.user.userId, req.user.orgId);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Sign contract' })
  async signContract(
    @Param('id') id: string,
    @Body() dto: SignContractDto,
    @Request() req,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.contractsService.signContract(
      id,
      dto,
      req.user.userId,
      req.user.orgId,
      ip,
      userAgent,
    );
  }

  @Post(':id/generate-pdf')
  @ApiOperation({ summary: 'Generate PDF from contract' })
  async generatePdf(@Param('id') id: string, @Body() dto: GeneratePdfDto, @Request() req) {
    const pdfUrl = await this.contractsService.generatePdf(id, req.user.orgId, dto);
    return { pdfUrl };
  }
}

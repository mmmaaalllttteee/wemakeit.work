import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractTemplate } from './entities/contract-template.entity';
import { Contract } from './entities/contract.entity';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateContractDto,
  UpdateContractDto,
  SignContractDto,
  SendForSignatureDto,
  GeneratePdfDto,
} from './dto/contract.dto';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(ContractTemplate)
    private templateRepository: Repository<ContractTemplate>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
  ) {
    this.registerHandlebarsHelpers();
  }

  // ==================== Templates ====================

  /**
   * Create a new contract template
   */
  async createTemplate(
    dto: CreateTemplateDto,
    userId: string,
    orgId: string,
  ): Promise<ContractTemplate> {
    const template = this.templateRepository.create({
      ...dto,
      orgId,
      createdBy: userId,
      version: 1,
      status: 'draft',
    });

    return this.templateRepository.save(template);
  }

  /**
   * Get all templates for organization
   */
  async getTemplates(orgId: string, category?: string): Promise<ContractTemplate[]> {
    const where: any = { orgId };
    if (category) {
      where.category = category;
    }

    return this.templateRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get official templates (WMIW provided)
   */
  async getOfficialTemplates(category?: string): Promise<ContractTemplate[]> {
    const where: any = { isOfficial: true, status: 'active' };
    if (category) {
      where.category = category;
    }

    return this.templateRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  /**
   * Get a specific template
   */
  async getTemplate(id: string, orgId: string): Promise<ContractTemplate> {
    const template = await this.templateRepository.findOne({
      where: [
        { id, orgId },
        { id, isOfficial: true }, // Allow access to official templates
      ],
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  /**
   * Update template (creates new version)
   */
  async updateTemplate(
    id: string,
    dto: UpdateTemplateDto,
    userId: string,
    orgId: string,
  ): Promise<ContractTemplate> {
    const existingTemplate = await this.getTemplate(id, orgId);

    if (existingTemplate.orgId !== orgId) {
      throw new BadRequestException('Cannot modify official templates');
    }

    // Archive old version
    existingTemplate.status = 'archived';
    await this.templateRepository.save(existingTemplate);

    // Create new version
    const newTemplate = this.templateRepository.create({
      ...existingTemplate,
      ...dto,
      id: undefined,
      version: existingTemplate.version + 1,
      previousVersionId: existingTemplate.id,
      lastModifiedBy: userId,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return this.templateRepository.save(newTemplate);
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string, orgId: string): Promise<void> {
    const template = await this.getTemplate(id, orgId);

    if (template.orgId !== orgId) {
      throw new BadRequestException('Cannot delete official templates');
    }

    if (template.usageCount > 0) {
      // Soft delete - archive instead
      template.status = 'archived';
      await this.templateRepository.save(template);
    } else {
      await this.templateRepository.remove(template);
    }
  }

  // ==================== Contracts ====================

  /**
   * Create a new contract
   */
  async createContract(dto: CreateContractDto, userId: string, orgId: string): Promise<Contract> {
    let content = dto.content || '';

    // If using a template, render it with variables
    if (dto.templateId) {
      const template = await this.getTemplate(dto.templateId, orgId);
      content = this.renderTemplate(template.content, dto.variables);

      // Increment template usage
      template.usageCount++;
      await this.templateRepository.save(template);
    }

    // Generate party IDs if not provided
    const parties = dto.parties.map((party) => ({
      ...party,
      id: uuidv4(),
    }));

    const contract = this.contractRepository.create({
      ...dto,
      orgId,
      content,
      parties,
      createdBy: userId,
      status: 'draft',
      auditLog: [
        {
          timestamp: new Date(),
          userId,
          userName: 'User',
          action: 'created',
          details: { title: dto.title },
        },
      ],
    });

    return this.contractRepository.save(contract);
  }

  /**
   * Get contracts
   */
  async getContracts(orgId: string, projectId?: string, status?: string): Promise<Contract[]> {
    const where: any = { orgId };
    if (projectId) {
      where.projectId = projectId;
    }
    if (status) {
      where.status = status;
    }

    return this.contractRepository.find({
      where,
      relations: ['template'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a specific contract
   */
  async getContract(id: string, orgId: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id, orgId },
      relations: ['template'],
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  /**
   * Update contract
   */
  async updateContract(
    id: string,
    dto: UpdateContractDto,
    userId: string,
    orgId: string,
  ): Promise<Contract> {
    const contract = await this.getContract(id, orgId);

    // Re-render content if variables changed
    if (dto.variables && contract.templateId) {
      const template = await this.getTemplate(contract.templateId, orgId);
      dto.content = this.renderTemplate(template.content, {
        ...contract.variables,
        ...dto.variables,
      });
    }

    Object.assign(contract, dto);

    // Add audit log entry
    if (!contract.auditLog) {
      contract.auditLog = [];
    }
    contract.auditLog.push({
      timestamp: new Date(),
      userId,
      userName: 'User',
      action: 'updated',
      details: dto,
    });

    return this.contractRepository.save(contract);
  }

  /**
   * Delete contract
   */
  async deleteContract(id: string, orgId: string): Promise<void> {
    const contract = await this.getContract(id, orgId);

    if (contract.status === 'signed' || contract.status === 'active') {
      throw new BadRequestException('Cannot delete signed or active contracts');
    }

    await this.contractRepository.remove(contract);
  }

  /**
   * Send contract for signature
   */
  async sendForSignature(
    id: string,
    dto: SendForSignatureDto,
    userId: string,
    orgId: string,
  ): Promise<Contract> {
    const contract = await this.getContract(id, orgId);

    // Validate parties exist
    const validPartyIds = contract.parties.map((p) => p.id);
    for (const partyId of dto.partyIds) {
      if (!validPartyIds.includes(partyId)) {
        throw new BadRequestException(`Invalid party ID: ${partyId}`);
      }
    }

    // Generate PDF if not exists
    if (!contract.pdfUrl) {
      await this.generatePdf(id, orgId);
      await this.contractRepository.findOne({ where: { id, orgId } }).then((c) => {
        if (c) {contract.pdfUrl = c.pdfUrl;}
      });
    }

    // Update status
    contract.status = 'pending_signatures';

    // Add audit log
    if (!contract.auditLog) {
      contract.auditLog = [];
    }
    contract.auditLog.push({
      timestamp: new Date(),
      userId,
      userName: 'User',
      action: 'sent_for_signature',
      details: { partyIds: dto.partyIds, message: dto.message },
    });

    // TODO: Send email notifications to parties
    // This would integrate with an email service

    return this.contractRepository.save(contract);
  }

  /**
   * Sign contract
   */
  async signContract(
    id: string,
    dto: SignContractDto,
    userId: string,
    orgId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<Contract> {
    const contract = await this.getContract(id, orgId);

    // Find party
    const party = contract.parties.find((p) => p.id === dto.partyId);
    if (!party) {
      throw new BadRequestException('Party not found');
    }

    if (party.signedAt) {
      throw new BadRequestException('Party has already signed');
    }

    // Update party signature
    party.signedAt = new Date();
    party.signatureData = dto.signatureData;
    party.ipAddress = ipAddress;
    party.userAgent = userAgent;

    // Add to signatures array
    if (!contract.signatures) {
      contract.signatures = [];
    }
    contract.signatures.push({
      partyId: dto.partyId,
      signedAt: new Date(),
      signatureData: dto.signatureData,
      ipAddress,
      method: dto.method,
      verified: true,
    });

    // Check if all parties have signed
    const allSigned = contract.parties.every((p) => p.signedAt);
    if (allSigned) {
      contract.status = 'signed';
      contract.fullySignedAt = new Date();

      // Generate signed PDF
      await this.generatePdf(id, orgId, { includeSignatures: true });
    }

    // Add audit log
    if (!contract.auditLog) {
      contract.auditLog = [];
    }
    contract.auditLog.push({
      timestamp: new Date(),
      userId,
      userName: party.name,
      action: 'signed',
      details: { partyId: dto.partyId, method: dto.method },
    });

    return this.contractRepository.save(contract);
  }

  /**
   * Generate PDF from contract
   */
  async generatePdf(id: string, orgId: string, options: GeneratePdfDto = {}): Promise<string> {
    const contract = await this.getContract(id, orgId);

    // Render HTML
    let html = this.wrapInHtmlTemplate(contract.content);

    // Add signatures if requested
    if (options.includeSignatures && contract.signatures) {
      const signaturesHtml = this.renderSignatures(contract);
      html = html.replace('</body>', `${signaturesHtml}</body>`);
    }

    // Add watermark if requested
    if (options.watermark) {
      html = html.replace(
        '<body',
        '<body style="background-image: url(\'data:image/svg+xml;base64,...\'); background-repeat: repeat;"',
      );
    }

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    await browser.close();

    // TODO: Upload to S3 using StorageService
    // For now, store as base64 (this is a placeholder)
    const pdfUrl = `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;

    // Update contract with PDF URL
    if (options.includeSignatures) {
      contract.signedPdfUrl = pdfUrl;
    } else {
      contract.pdfUrl = pdfUrl;
    }
    await this.contractRepository.save(contract);

    return pdfUrl;
  }

  // ==================== Private Helper Methods ====================

  /**
   * Render template with variables using Handlebars
   */
  private renderTemplate(template: string, variables: Record<string, any>): string {
    const compiled = Handlebars.compile(template);
    return compiled(variables);
  }

  /**
   * Wrap content in HTML template
   */
  private wrapInHtmlTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
          }
          h1 { font-size: 24pt; margin-bottom: 10pt; }
          h2 { font-size: 18pt; margin-top: 20pt; margin-bottom: 10pt; }
          h3 { font-size: 14pt; margin-top: 15pt; margin-bottom: 8pt; }
          p { margin-bottom: 10pt; }
          .signature-section {
            margin-top: 40pt;
            page-break-inside: avoid;
          }
          .signature-block {
            display: inline-block;
            width: 45%;
            margin: 20pt 2% 20pt 0;
            vertical-align: top;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 30pt;
            padding-top: 5pt;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  }

  /**
   * Render signature blocks
   */
  private renderSignatures(contract: Contract): string {
    let html = '<div class="signature-section"><h2>Signatures</h2>';

    for (const party of contract.parties) {
      html += `
        <div class="signature-block">
          <div><strong>${party.role}</strong></div>
          ${
            party.signedAt
              ? `
            <img src="${party.signatureData}" style="max-width: 200px; height: 60px;" />
            <div class="signature-line">
              ${party.name}<br/>
              Date: ${new Date(party.signedAt).toLocaleDateString()}
            </div>
          `
              : `
            <div class="signature-line">
              ${party.name}<br/>
              Date: _______________
            </div>
          `
          }
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHandlebarsHelpers() {
    Handlebars.registerHelper('formatDate', (date: Date) => new Date(date).toLocaleDateString('de-DE'));

    Handlebars.registerHelper('formatCurrency', (amount: number, currency = 'EUR') => new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency,
      }).format(amount));

    Handlebars.registerHelper('uppercase', (str: string) => str.toUpperCase());

    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
  }
}

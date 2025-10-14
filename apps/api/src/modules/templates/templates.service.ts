import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardTemplate } from './entities/board-template.entity';
import { Board } from '../project/entities/board.entity';
import { Task } from '../project/entities/task.entity';
import { CreateBoardTemplateDto, ApplyTemplateDto } from './dto/template.dto';
import { DEFAULT_BOARD_TEMPLATES } from './templates.seed';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TemplatesService implements OnModuleInit {
  constructor(
    @InjectRepository(BoardTemplate)
    private templateRepository: Repository<BoardTemplate>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  /**
   * Seed default templates on module initialization
   */
  async onModuleInit() {
    const count = await this.templateRepository.count({ where: { isOfficial: true } });

    if (count === 0) {
      console.log('📝 Seeding default board templates...');
      for (const template of DEFAULT_BOARD_TEMPLATES) {
        await this.templateRepository.save(this.templateRepository.create(template as any));
      }
      console.log('✅ Default board templates seeded successfully');
    }
  }

  /**
   * Get all templates (public + user's private)
   */
  async getTemplates(userId: string, orgId: string, category?: string): Promise<BoardTemplate[]> {
    const queryBuilder = this.templateRepository
      .createQueryBuilder('template')
      .where('template.isPublic = :isPublic', { isPublic: true })
      .orWhere('template.orgId = :orgId', { orgId })
      .orWhere('template.createdBy = :userId', { userId });

    if (category) {
      queryBuilder.andWhere('template.category = :category', { category });
    }

    return await queryBuilder
      .orderBy('template.isOfficial', 'DESC')
      .addOrderBy('template.usageCount', 'DESC')
      .addOrderBy('template.name', 'ASC')
      .getMany();
  }

  /**
   * Get single template
   */
  async getTemplate(id: string): Promise<BoardTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  /**
   * Create custom template
   */
  async createTemplate(
    dto: CreateBoardTemplateDto,
    userId: string,
    orgId: string,
  ): Promise<BoardTemplate> {
    const template = this.templateRepository.create({
      ...dto,
      orgId,
      createdBy: userId,
      isOfficial: false,
      usageCount: 0,
    });

    return await this.templateRepository.save(template);
  }

  /**
   * Apply template to project
   */
  async applyTemplate(dto: ApplyTemplateDto, userId: string): Promise<Board> {
    const template = await this.getTemplate(dto.templateId);

    // Create board from template
    const board = this.boardRepository.create({
      name: dto.boardName || template.name,
      projectId: dto.projectId,
      createdBy: userId,
      columns: template.columns,
      visibility: 'team',
      templateId: template.id,
    });

    const savedBoard = await this.boardRepository.save(board);

    // Create tasks from template
    const startDate = dto.customizations?.startDate
      ? new Date(dto.customizations.startDate)
      : new Date();

    const tasks = template.tasks.map((taskTemplate, index) => {
      let dueDate: Date | null = null;
      if (taskTemplate.dueOffset !== undefined) {
        dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + taskTemplate.dueOffset);
      }

      return this.taskRepository.create({
        boardId: savedBoard.id,
        columnId: taskTemplate.columnId,
        title: taskTemplate.title,
        description: taskTemplate.description,
        priority: taskTemplate.priority || 'medium',
        status: 'todo',
        position: index,
        dueDate,
        labels: taskTemplate.labels || [],
        checklist: taskTemplate.checklist || [],
        createdBy: userId,
      });
    });

    await this.taskRepository.save(tasks);

    // Increment usage count
    template.usageCount += 1;
    await this.templateRepository.save(template);

    return savedBoard;
  }

  /**
   * Delete custom template
   */
  async deleteTemplate(id: string, userId: string, orgId: string): Promise<void> {
    const template = await this.getTemplate(id);

    // Only allow deleting own templates or org templates (not official)
    if (template.isOfficial) {
      throw new NotFoundException('Cannot delete official templates');
    }

    if (template.createdBy !== userId && template.orgId !== orgId) {
      throw new NotFoundException('Not authorized');
    }

    await this.templateRepository.remove(template);
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { Widget } from './entities/widget.entity';
import { Note } from './entities/note.entity';
import { Project } from '../project/entities/project.entity';
import { Task } from '../project/entities/task.entity';
import { File } from '../files/entities/file.entity';
import { User } from '../auth/entities/user.entity';
import {
  CreateWidgetDto,
  UpdateWidgetDto,
  ReorderWidgetsDto,
  CreateNoteDto,
  UpdateNoteDto,
  DashboardStatsDto,
} from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Widget)
    private widgetRepository: Repository<Widget>,
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ==================== Widgets ====================

  async createWidget(dto: CreateWidgetDto, userId: string, orgId: string): Promise<Widget> {
    // Get max position
    const maxPosition = await this.widgetRepository
      .createQueryBuilder('widget')
      .where('widget.userId = :userId', { userId })
      .select('MAX(widget.position)', 'max')
      .getRawOne();

    const widget = this.widgetRepository.create({
      ...dto,
      userId,
      orgId,
      position: (maxPosition?.max || 0) + 1,
      size: dto.size || 'medium',
    });

    return await this.widgetRepository.save(widget);
  }

  async getWidgets(userId: string, projectId?: string): Promise<Widget[]> {
    const where: any = { userId, isVisible: true };
    if (projectId) {
      where.projectId = projectId;
    }

    return await this.widgetRepository.find({
      where,
      order: { position: 'ASC' },
    });
  }

  async updateWidget(id: string, dto: UpdateWidgetDto, userId: string): Promise<Widget> {
    const widget = await this.widgetRepository.findOne({
      where: { id, userId },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    Object.assign(widget, dto);
    return await this.widgetRepository.save(widget);
  }

  async deleteWidget(id: string, userId: string): Promise<void> {
    const widget = await this.widgetRepository.findOne({
      where: { id, userId },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    await this.widgetRepository.remove(widget);
  }

  async reorderWidgets(dto: ReorderWidgetsDto, userId: string): Promise<void> {
    const widgets = await this.widgetRepository.find({
      where: { userId },
    });

    for (const widget of widgets) {
      if (dto.positions[widget.id] !== undefined) {
        widget.position = dto.positions[widget.id];
      }
    }

    await this.widgetRepository.save(widgets);
  }

  // ==================== Notes (Post-its) ====================

  async createNote(dto: CreateNoteDto, userId: string, orgId: string): Promise<Note> {
    // Get max position
    const maxPosition = await this.noteRepository
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId })
      .andWhere('note.scope = :scope', { scope: dto.scope || 'organization' })
      .select('MAX(note.position)', 'max')
      .getRawOne();

    const note = this.noteRepository.create({
      ...dto,
      userId,
      orgId,
      color: dto.color || 'yellow',
      scope: dto.scope || 'organization',
      position: (maxPosition?.max || 0) + 1,
    });

    return await this.noteRepository.save(note);
  }

  async getNotes(
    userId: string,
    orgId: string,
    scope?: 'personal' | 'organization' | 'project',
    projectId?: string,
  ): Promise<Note[]> {
    const queryBuilder = this.noteRepository
      .createQueryBuilder('note')
      .where('note.orgId = :orgId', { orgId });

    if (scope === 'personal') {
      queryBuilder.andWhere('note.userId = :userId', { userId });
      queryBuilder.andWhere('note.scope = :scope', { scope: 'personal' });
    } else if (scope === 'project' && projectId) {
      queryBuilder.andWhere('note.projectId = :projectId', { projectId });
      queryBuilder.andWhere('note.scope = :scope', { scope: 'project' });
    } else {
      // Organization scope - visible to all users in org
      queryBuilder.andWhere('note.scope = :scope', { scope: 'organization' });
    }

    return await queryBuilder
      .orderBy('note.isPinned', 'DESC')
      .addOrderBy('note.position', 'ASC')
      .getMany();
  }

  async updateNote(id: string, dto: UpdateNoteDto, userId: string, orgId: string): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id, orgId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Only allow updating own notes unless it's organization scope
    if (note.scope === 'personal' && note.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    Object.assign(note, dto);
    return await this.noteRepository.save(note);
  }

  async deleteNote(id: string, userId: string, orgId: string): Promise<void> {
    const note = await this.noteRepository.findOne({
      where: { id, orgId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Only allow deleting own notes
    if (note.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.noteRepository.remove(note);
  }

  // ==================== Dashboard Stats ====================

  async getDashboardStats(orgId: string): Promise<DashboardStatsDto> {
    // Projects stats
    const totalProjects = await this.projectRepository.count({ where: { orgId } });
    const activeProjects = await this.projectRepository.count({
      where: { orgId, status: 'active' },
    });
    const archivedProjects = await this.projectRepository.count({
      where: { orgId, status: 'archived' },
    });

    // Tasks stats
    const projects = await this.projectRepository.find({
      where: { orgId },
      select: ['id'],
    });
    const projectIds = projects.map((p) => p.id);

    let totalTasks = 0;
    let todoTasks = 0;
    let inProgressTasks = 0;
    let doneTasks = 0;
    let overdueTasks = 0;

    if (projectIds.length > 0) {
      totalTasks = await this.taskRepository
        .createQueryBuilder('task')
        .innerJoin('task.board', 'board')
        .where('board.projectId IN (:...projectIds)', { projectIds })
        .getCount();

      todoTasks = await this.taskRepository
        .createQueryBuilder('task')
        .innerJoin('task.board', 'board')
        .where('board.projectId IN (:...projectIds)', { projectIds })
        .andWhere('task.status = :status', { status: 'todo' })
        .getCount();

      inProgressTasks = await this.taskRepository
        .createQueryBuilder('task')
        .innerJoin('task.board', 'board')
        .where('board.projectId IN (:...projectIds)', { projectIds })
        .andWhere('task.status = :status', { status: 'in_progress' })
        .getCount();

      doneTasks = await this.taskRepository
        .createQueryBuilder('task')
        .innerJoin('task.board', 'board')
        .where('board.projectId IN (:...projectIds)', { projectIds })
        .andWhere('task.status = :status', { status: 'done' })
        .getCount();

      // Overdue tasks
      overdueTasks = await this.taskRepository
        .createQueryBuilder('task')
        .innerJoin('task.board', 'board')
        .where('board.projectId IN (:...projectIds)', { projectIds })
        .andWhere('task.dueDate < :now', { now: new Date() })
        .andWhere('task.status != :status', { status: 'done' })
        .getCount();
    }

    // Files stats
    const totalFiles = await this.fileRepository.count({
      where: { orgId, status: 'active', isFolder: false },
    });
    const fileSizeResult = await this.fileRepository
      .createQueryBuilder('file')
      .select('SUM(file.size)', 'total')
      .where('file.orgId = :orgId', { orgId })
      .andWhere('file.status = :status', { status: 'active' })
      .andWhere('file.isFolder = :isFolder', { isFolder: false })
      .getRawOne();

    // Team stats
    const teamMembers = await this.userRepository.count({
      where: { orgId, status: 'active' },
    });

    return {
      projects: {
        total: totalProjects,
        active: activeProjects,
        archived: archivedProjects,
      },
      tasks: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
        overdue: overdueTasks,
      },
      files: {
        total: totalFiles,
        size: fileSizeResult?.total || 0,
      },
      team: {
        members: teamMembers,
      },
    };
  }
}

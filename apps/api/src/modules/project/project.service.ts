import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Project } from './entities/project.entity';
import { Board } from './entities/board.entity';
import { Task } from './entities/task.entity';
import { User } from '../auth/entities/user.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto/task.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  // ============================================
  // PROJECTS
  // ============================================

  async createProject(createProjectDto: CreateProjectDto, user: User): Promise<Project> {
    const slug = createProjectDto.slug || this.generateSlug(createProjectDto.name);

    // Check if slug exists in org
    const existing = await this.projectRepository.findOne({
      where: { orgId: user.orgId, slug },
    });

    if (existing) {
      throw new BadRequestException('Project with this slug already exists');
    }

    const project = this.projectRepository.create({
      ...createProjectDto,
      slug,
      orgId: user.orgId,
      ownerId: user.id,
      status: 'active',
    });

    return this.projectRepository.save(project);
  }

  async getProjects(user: User): Promise<Project[]> {
    return this.projectRepository.find({
      where: { orgId: user.orgId },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async getProject(id: string, user: User): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id, orgId: user.orgId },
      relations: ['owner', 'boards'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
    user: User,
  ): Promise<Project> {
    const project = await this.getProject(id, user);

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async deleteProject(id: string, user: User): Promise<void> {
    const project = await this.getProject(id, user);

    // Only owner or admin can delete
    if (project.ownerId !== user.id && user.role !== 'admin' && user.role !== 'owner') {
      throw new ForbiddenException('Only project owner or admin can delete project');
    }

    await this.projectRepository.remove(project);
  }

  // ============================================
  // BOARDS
  // ============================================

  async createBoard(projectId: string, createBoardDto: CreateBoardDto, user: User): Promise<Board> {
    const project = await this.getProject(projectId, user);

    // Create default columns
    const defaultColumns = [
      { id: uuidv4(), name: 'To Do', position: 0 },
      { id: uuidv4(), name: 'In Progress', position: 1 },
      { id: uuidv4(), name: 'Review', position: 2 },
      { id: uuidv4(), name: 'Done', position: 3 },
    ];

    const board = this.boardRepository.create({
      ...createBoardDto,
      projectId: project.id,
      createdBy: user.id,
      visibility: createBoardDto.visibility || 'team',
      columns: defaultColumns,
    });

    return this.boardRepository.save(board);
  }

  async getBoard(id: string, user: User): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['project', 'tasks', 'tasks.assignee', 'tasks.creator'],
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check org access
    if (board.project.orgId !== user.orgId) {
      throw new ForbiddenException('Access denied');
    }

    // Sort tasks by position
    if (board.tasks) {
      board.tasks.sort((a, b) => a.position - b.position);
    }

    return board;
  }

  async getProjectBoards(projectId: string, user: User): Promise<Board[]> {
    const project = await this.getProject(projectId, user);

    return this.boardRepository.find({
      where: { projectId: project.id },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateBoard(id: string, updateBoardDto: UpdateBoardDto, user: User): Promise<Board> {
    const board = await this.getBoard(id, user);

    Object.assign(board, updateBoardDto);
    return this.boardRepository.save(board);
  }

  async deleteBoard(id: string, user: User): Promise<void> {
    const board = await this.getBoard(id, user);
    await this.boardRepository.remove(board);
  }

  // ============================================
  // TASKS
  // ============================================

  async createTask(boardId: string, createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const board = await this.getBoard(boardId, user);

    // Validate column exists
    const column = board.columns.find((col) => col.id === createTaskDto.columnId);
    if (!column) {
      throw new BadRequestException('Column not found');
    }

    // Get max position in column
    const maxPosition = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.boardId = :boardId', { boardId })
      .andWhere('task.columnId = :columnId', { columnId: createTaskDto.columnId })
      .select('MAX(task.position)', 'max')
      .getRawOne();

    const position = (maxPosition?.max || 0) + 1;

    const task = this.taskRepository.create({
      ...createTaskDto,
      boardId,
      createdBy: user.id,
      status: 'todo',
      priority: createTaskDto.priority || 'medium',
      position,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
    });

    return this.taskRepository.save(task);
  }

  async getTask(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['board', 'board.project', 'assignee', 'creator'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check org access
    if (task.board.project.orgId !== user.orgId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.getTask(id, user);

    Object.assign(task, {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : task.dueDate,
    });

    return this.taskRepository.save(task);
  }

  async moveTask(id: string, moveTaskDto: MoveTaskDto, user: User): Promise<Task> {
    const task = await this.getTask(id, user);
    const board = await this.getBoard(task.boardId, user);

    // Validate column exists
    const column = board.columns.find((col) => col.id === moveTaskDto.columnId);
    if (!column) {
      throw new BadRequestException('Column not found');
    }

    task.columnId = moveTaskDto.columnId;
    task.position = moveTaskDto.position;

    return this.taskRepository.save(task);
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const task = await this.getTask(id, user);
    await this.taskRepository.remove(task);
  }

  // ============================================
  // HELPERS
  // ============================================

  private generateSlug(name: string): string {
    return (
      `${name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100) 
      }-${ 
      Math.random().toString(36).substring(7)}`
    );
  }
}

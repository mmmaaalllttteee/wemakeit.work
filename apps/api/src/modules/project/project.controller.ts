import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CurrentUser } from '../auth/decorators/auth.decorators';
import { User } from '../auth/entities/user.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto/task.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // ============================================
  // PROJECTS
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async createProject(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: User) {
    return this.projectService.createProject(createProjectDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for organization' })
  @ApiResponse({ status: 200, description: 'Projects retrieved' })
  async getProjects(@CurrentUser() user: User) {
    return this.projectService.getProjects(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProject(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectService.getProject(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.updateProject(id, updateProjectDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 204, description: 'Project deleted' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async deleteProject(@Param('id') id: string, @CurrentUser() user: User) {
    await this.projectService.deleteProject(id, user);
  }

  // ============================================
  // BOARDS
  // ============================================

  @Post(':id/boards')
  @ApiOperation({ summary: 'Create a new board in project' })
  @ApiResponse({ status: 201, description: 'Board created' })
  async createBoard(
    @Param('id') projectId: string,
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.createBoard(projectId, createBoardDto, user);
  }

  @Get(':id/boards')
  @ApiOperation({ summary: 'Get all boards for project' })
  @ApiResponse({ status: 200, description: 'Boards retrieved' })
  async getProjectBoards(@Param('id') projectId: string, @CurrentUser() user: User) {
    return this.projectService.getProjectBoards(projectId, user);
  }

  // ============================================
  // BOARD OPERATIONS
  // ============================================

  @Get('boards/:id')
  @ApiOperation({ summary: 'Get board by ID' })
  @ApiResponse({ status: 200, description: 'Board retrieved' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async getBoard(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectService.getBoard(id, user);
  }

  @Patch('boards/:id')
  @ApiOperation({ summary: 'Update board' })
  @ApiResponse({ status: 200, description: 'Board updated' })
  async updateBoard(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.updateBoard(id, updateBoardDto, user);
  }

  @Delete('boards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete board' })
  @ApiResponse({ status: 204, description: 'Board deleted' })
  async deleteBoard(@Param('id') id: string, @CurrentUser() user: User) {
    await this.projectService.deleteBoard(id, user);
  }

  // ============================================
  // TASKS
  // ============================================

  @Post('boards/:id/tasks')
  @ApiOperation({ summary: 'Create a new task in board' })
  @ApiResponse({ status: 201, description: 'Task created' })
  async createTask(
    @Param('id') boardId: string,
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.createTask(boardId, createTaskDto, user);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved' })
  async getTask(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectService.getTask(id, user);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.updateTask(id, updateTaskDto, user);
  }

  @Post('tasks/:id/move')
  @ApiOperation({ summary: 'Move task to different column/position' })
  @ApiResponse({ status: 200, description: 'Task moved' })
  async moveTask(
    @Param('id') id: string,
    @Body() moveTaskDto: MoveTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.moveTask(id, moveTaskDto, user);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 204, description: 'Task deleted' })
  async deleteTask(@Param('id') id: string, @CurrentUser() user: User) {
    await this.projectService.deleteTask(id, user);
  }
}

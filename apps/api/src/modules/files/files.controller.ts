import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CurrentUser } from '../auth/decorators/auth.decorators';
import { User } from '../auth/entities/user.entity';
import {
  CreateFolderDto,
  UpdateFileDto,
  PresignedUploadDto,
  CompleteUploadDto,
  MoveFilesDto,
  ShareFileDto,
  FileQueryDto,
} from './dto/file.dto';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload/init')
  @ApiOperation({ summary: 'Initialize file upload - get presigned URL' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated' })
  async initializeUpload(@Body() dto: PresignedUploadDto, @CurrentUser() user: User) {
    return await this.filesService.initializeUpload(dto, user.id, user.orgId);
  }

  @Post('upload/complete')
  @ApiOperation({ summary: 'Complete file upload' })
  @ApiResponse({ status: 200, description: 'Upload completed' })
  async completeUpload(@Body() dto: CompleteUploadDto, @CurrentUser() user: User) {
    return await this.filesService.completeUpload(dto, user.id, user.orgId);
  }

  @Post('folders')
  @ApiOperation({ summary: 'Create folder' })
  @ApiResponse({ status: 201, description: 'Folder created' })
  async createFolder(@Body() dto: CreateFolderDto, @CurrentUser() user: User) {
    return await this.filesService.createFolder(dto, user.id, user.orgId);
  }

  @Get()
  @ApiOperation({ summary: 'List files and folders' })
  @ApiResponse({ status: 200, description: 'Files retrieved' })
  async getFiles(@Query() query: FileQueryDto, @CurrentUser() user: User) {
    return await this.filesService.getFiles(query, user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file details' })
  @ApiResponse({ status: 200, description: 'File retrieved' })
  async getFile(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.filesService.getFile(id, user.orgId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update file metadata' })
  @ApiResponse({ status: 200, description: 'File updated' })
  async updateFile(@Param('id') id: string, @Body() dto: UpdateFileDto, @CurrentUser() user: User) {
    return await this.filesService.updateFile(id, dto, user.id, user.orgId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 204, description: 'File deleted' })
  async deleteFile(@Param('id') id: string, @CurrentUser() user: User) {
    await this.filesService.deleteFile(id, user.id, user.orgId);
  }

  @Post('move')
  @ApiOperation({ summary: 'Move files to folder' })
  @ApiResponse({ status: 200, description: 'Files moved' })
  async moveFiles(@Body() dto: MoveFilesDto, @CurrentUser() user: User) {
    await this.filesService.moveFiles(dto, user.id, user.orgId);
    return { message: 'Files moved successfully' };
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share file' })
  @ApiResponse({ status: 200, description: 'File shared' })
  async shareFile(@Param('id') id: string, @Body() dto: ShareFileDto, @CurrentUser() user: User) {
    return await this.filesService.shareFile(id, dto, user.id, user.orgId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download URL' })
  @ApiResponse({ status: 200, description: 'Download URL generated' })
  async getDownloadUrl(@Param('id') id: string, @CurrentUser() user: User) {
    const url = await this.filesService.getDownloadUrl(id, user.orgId, user.id);
    return { url };
  }
}
